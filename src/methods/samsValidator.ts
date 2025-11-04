import { getPackagePath } from "../utils"

/**
 * Universal validation handler that intelligently detects and executes
 * validation logic for multiple popular libraries (Yup, Zod, Joi, Valibot,
 * Class-Validator, Typia).
 *
 * This function is designed to work seamlessly with @sams-ts/core’s
 * validation pipeline. It dynamically adapts to whichever validation
 * library is present in the project — without requiring any fixed dependency.
 */
export const samsValidator = async (
  payload: object,
  type: any,
  decoratorArgs: Record<string | number, any>
): Promise<any> => {
  const candidate = decoratorArgs?.[0]

  // 🔹 1. Yup
  const yupPath = getPackagePath("yup")
  if (yupPath && candidate?.validate) {
    return await candidate.validate(payload)
  }

  // 🔹 2. Zod
  const zodPath = getPackagePath("zod")
  if (zodPath && candidate?.safeParse) {
    const result = candidate.safeParse(payload)
    if (!result.success) throw result.error
    return result.data
  }

  // 🔹 3. Joi
  const joiPath = getPackagePath("joi")
  if (joiPath && candidate?.validateAsync) {
    return await candidate.validateAsync(payload)
  }

  // 🔹 4. Valibot
  const valibotPath = getPackagePath("valibot")
  if (valibotPath && candidate?.schema && typeof candidate.parse === "function") {
    return candidate.parse(payload)
  }

   // 🔹 5. TypeBox
  const stbPath = getPackagePath("@sinclair/typebox")
  if (stbPath) {
    const { Value } = require(stbPath)
    if (candidate?.type === "object" || candidate?.type === "array" || candidate?.$id) {
      if (!Value.Check(candidate, payload)) {
        const errors = [...Value.Errors(candidate, payload)]
        throw new Error(JSON.stringify(errors))
      }
      return Value.Cast(candidate, payload)
    }
  }

  // 🔹 6. class-validator (only if installed)
  const cvp = getPackagePath("class-validator")
  if (cvp) {
    const { validateOrReject } = require(cvp)
    const inst = new type()
    Object.assign(inst, payload)
    await validateOrReject(inst)
    return inst
  }

  // 🔹 7. Typia (only if installed)
  const typiaPath = getPackagePath("typia")
  if (typiaPath) {
    const { assert } = require(typiaPath)
    assert(payload)
    return payload
  }

  // Default → No validation performed
  return payload
}

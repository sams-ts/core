This library aims to facilitate making express apps with dependency injection.
Interface of this library is very simple and we aim to keep it close to express.

To beign, you can import App decorator from sams-ts/core and use it like this:

```ts
import express from "express"
import { App } from "@sams-ts/core"

const PORT = process.env.PORT || 3500;

@App({ port: PORT })
class TestApp {}
```

This will get a basic app started over just like you do in express.
Now normally, you would create routers, and controllers in traditional way and register them
but now, instead of doing that, all you have to do is import @Controller and mappings:
@Get, @Post, @Put, @Patch, @Delete
and make a controller like this:

```ts
import { Controller, Get } from "@sams-ts/core";
import { Request, Response } from "express";

@Controller("/api/user")
class UserController {
    @Get("/:id")
    public async getUser(req: Request, res: Response) {
        res.status(200).send({ id: 1, name: "Hello World" })   
    }
}

export default UserController
```

By default, sams-ts/core resolves all these files in `src` directory inside your project root
If you've different structure, then you can specify it here like this:

```ts
@App({ port: ..., appRootPath: "app" })
```

Please avoid using root as your appRootPath because otherwise it will start scanning node_modules
that might take forever

isn't it awesome?

Now that isn't it, this library was mainly designed to be a lightweight singleton dependency injection library.
Therefore, you can as of now, make property injections & constructor injections.

Here is a example for how would development flow go with this library

user.repository.ts
```ts
import { Component } from "@sams-ts/core"

@Component()
class UserRepository {
    public async getUser() {
        return { id: 1, name: "Mehdi" }
    }
}

export default UserRepository
```

user.service.ts
```ts
import { Autowired, Component } from "sams-ts/core";
import UserRepository from "./user.repository";

@Component()
class UserService {
    @Autowired() private userRepo: UserRepository // This is a Property Injection
    constructor(private readonly userRepo: UserRepository) {} // This is a constructor injection

    /* Constructor injections are performed automatically if class is marked as Component */

    public async getUser() {
        return await this.userRepo.getUser() 
    }
}

export default UserService
```

user.controller.ts
```ts
import { Controller, Get } from "sams-ts/core";
import { Request, Response, NextFunction } from "express";
import UserService from "./user.service";

@Controller("/api/user")
class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("/:id")
    public async getUser(req: Request, res: Response, next: NextFunction) {
        const user = await this.userService.getUser()
        res.status(200).send({ ...user, params: req.params, query: req.query })   
    }
}

export default UserController
```

# Customising Validation in sams-ts/core

⚠️ This section is only for customizing how validations work in @sams-ts/core.
@sams-ts/core already has validation support for following libraries built into it:

- Yup
- Zod
- Joi
- Valibot
- TypeBox
- class-validator
- Typia

For above libraries, validation is going to work out of the box means you don't have
to import setValidator function or do anything. Here are some snippets of libraries:

```ts
import { Body, Controller, Post, Param } from "@sams-ts/core"

// 1️⃣ Yup
import * as yup from "yup"

// 2️⃣ Zod
import { z } from "zod"

// 3️⃣ Joi
import Joi from "joi"

// 4️⃣ Valibot
import { object, string, parse } from "valibot"

// 5️⃣ TypeBox
import { Type, Static } from "@sinclair/typebox"

// 6️⃣ class-validator
import { IsString, IsEmail } from "class-validator"

// 7️⃣ typia (optional runtime validation)
import typia from "typia"

//
// 🧱 Schema definitions
//

// ✅ Yup Schema
const yupSchema = yup.object({
  username: yup.string().required(),
  email: yup.string().email().required(),
})

// ✅ Zod Schema
const zodSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
})

// ✅ Joi Schema
const joiSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
})

// ✅ Valibot Schema
const valibotSchema = object({
  username: string(),
  email: string(),
})

// ✅ TypeBox Schema
const typeboxSchema = Type.Object({
  username: Type.String(),
  email: Type.String({ format: "email" }),
})
type TypeboxUser = Static<typeof typeboxSchema>

// ✅ Class-Validator DTO
class CreateUserDto {
  @IsString()
  username: string

  @IsEmail()
  email: string
}

// ✅ typia Type
interface TypiaUser {
  username: string
  email: string
}

//
// 🧩 Controller
//
@Controller("/api/users")
export class UserController {

  // ✅ 1. Yup Validation
  @Post("/yup")
  async createWithYup(@Body(yupSchema) body: yup.InferType<typeof yupSchema>) {
    return { library: "yup", body }
  }

  // ✅ 2. Zod Validation
  @Post("/zod")
  async createWithZod(@Body(zodSchema) body: z.infer<typeof zodSchema>) {
    return { library: "zod", body }
  }

  // ✅ 3. Joi Validation
  @Post("/joi")
  async createWithJoi(@Body(joiSchema) body: any) {
    return { library: "joi", body }
  }

  // ✅ 4. Valibot Validation
  @Post("/valibot")
  async createWithValibot(@Body(valibotSchema) body: ReturnType<typeof parse>) {
    return { library: "valibot", body }
  }

  // ✅ 5. TypeBox Validation
  @Post("/typebox")
  async createWithTypebox(@Body(typeboxSchema) body: TypeboxUser) {
    return { library: "typebox", body }
  }

  // ✅ 6. Class-Validator
  @Post("/class-validator")
  async createWithClassValidator(@Body() body: CreateUserDto) {
    return { library: "class-validator", body }
  }

  // ✅ 7. typia
  @Post("/typia")
  async createWithTypia(@Body() body: TypiaUser) {
    return { library: "typia", body }
  }
}
```

@sams-ts/core offers much more flexibility when it comes to performing validations. It provides you with
such an interface that makes it very easy to plug-in any validation library of your choice.

⚠️ One thing that you must remember is that It's executed right before the request handler executes. It **does not**
apply at all to middlewares so don't expect it to work in middlewares nor decorators @Body, @Param and @Query 
are supposed to be used in middlewares. They won't work.

You can create a file with any name say ```validator.ts``` and use our function ```setValidator``` imported
from @sams-ts/core to add your own validation function like this:

```ts
import { setValidator } from "@sams-ts/core"

setValidator(async(payload, type, decoratorArguments) => {
    /* Your custom validation logic */
}) 
```

It will be executed whenever you use @Body, @Param or @Query decorator.
We're sure you've noticed `payload`, `type` and `decoratorArguments` and probably thinking what are these.
They are simpler than they look, let's take an example below to understand why they
exist and how can we use them.

Now you'll have a controller like below i:e user.controller.ts,

```ts
import { Controller, Post, Body, Param } from "@sams-ts/core"

@Controller("/api/user")
export class UserController {
    @Post("/create")
    async createUser(@Body() body: any) {
        return { body }
    }

    @Post("/subscription")
    async createSubscription(@Param() params: any) {
        return { params }
    }
}
```

As you can obviously guess, body in createUser method will be express's req.body and
params would be req.params. That's exactly what `payload` points to in setValidator
function. Since decorators (Body, Param, Query) share same validator function, calling
them i:e @Body() body: any would invoke your handler with payload = body, similarly
when using params, payload would be params object.

Now the `type` parameter reflects the type of the parameter. It can have like a
number of usecases. We will cover one example below.

Next thing is `decoratorArguments`. It refers to whatever you pass into the decorator as arguments.
Like if i pass @Body({ hello: "World" }), then at runtime, decoratorArguments[0] would be { hello: "World" }.
Similarly, @Body(1,2,3,4) would result in decoratorArguments = { '0': 1, '1': 2, '2': 3, '3': 4}.

Now why was such a thing needed? It's because we left it to you to customize it as you
want. This enables us to support validations for any library that exists that too in parallel.
Below are three examples of validation with "yup", "class-validator" and then both combined.

Here's our user.controller.ts file

```ts
import { Body, Controller, Param, Post } from "@sams-ts/core"
import { IsString } from "class-validator"
import * as yup from "yup"

const paramsSchema = yup.object({
    id: yup.string().required(),
})

class CreateUserDto {
    @IsString()
    username: string;
}

@Controller("/api/users")
export class UserController {

    @Post("/create/:id")
    async createUser(@Body() body: CreateUserDto) {
        return { body }
    }

    @Post("/subscription")
    createSubscription(@Param(paramsSchema) params: yup.InferType<typeof paramsSchema>) {
        return { params }
    }
}
```

Here's our validator.ts file

```ts
import { setValidator } from "@sams-ts/core"

import { validateOrReject } from "class-validator"

import { ObjectSchema } from "yup"

setValidator(async(object, type, decoratorArguments) => {
    const schema = decoratorArguments?.[0];
    if(schema instanceof ObjectSchema) return await schema.validate(object);
    else if(!(schema instanceof ObjectSchema)) {
        const inst = new type()
        Object.assign(inst, object)
        await validateOrReject(inst)
    }
}) 
```

We made two endpoints, that use different decorators, with two very good libraries.

Let's study it one by one

### Create User method with Class-Validator

When we do 
```ts
@Body() body: CreateUserDto
```

Our validator function gets payload that'll be req.body, and type is going to be CreateUserDto
class, hence you can see we instantiated the type, assigned the object to class instance and
validated it exactly like the docs of class-validator.

### Create Subscription method with Yup

When we do @Param(paramsSchema) params: yup.InferType<typeof paramsSchema>, the validator
function receives "req.params" as payload, type can be ignored here as we don't need it.
We need actual schema for yup to validate, so what we did is we passed schema to the
decorator itself hence we can access it as decoratorArguments[0]. Thus we were able to
call validate asynchronously and it worked.

The whole point of having such a thing is its open for extension to literally any library
or your own custom validation logic. And if you want to optionally pass around some objects
with data, you can also do it easily. hence more customizable.

When you follow above docs, you'll loose above validation working out of the box.
If you ever want to sort of extend it import our builtin validator

```ts
import { samsValidator } from "@sams-ts/core"
```

and call it inside of your own function like this

```ts
import { setValidator } from "@sams-ts/core"

import { samsValidator } from "@sams-ts/core"

setValidator(async(payload, type, decoratorArguments) => {
    /* Your custom validation logic */
    await samsValidator(payload, type, decoratorArguments)
}) 
```

# Customize error response:

Let's imagine, you want to customize the error object returned as response, then you can
use setErrorAccessor method

This ```ts setErrorAccessor``` function takes a callback function.
sams-ts/core will automatically pass thrown error to this callback function at runtime
and send back value returned by this function as response to user

Here's how you can define an error accessor function and set it as a global error handler

```ts
import { setErrorAccessor } from "sams-ts/core"

/* Feel free to name it */
function parseError(error: any) {
    return error?.details?.whatever
}

setErrorAccessor(parseError)

// in handler

@Post()
async test(@Req() req: Request) {
    const validated = await schema.validate(req.body)
    return { ...body, url: req?.url }
}
```

And yes, thats all you have to do, body will automatically be validated against LoginDto or yup schema.
for errors you'll get returned value of your function parseError with 400 status code. 

Now you'll be thinking how will i access req & res objects in this handlers since that seems to be lost,
We have following additonal decorators as well to manage it:

1. Req (injects request object)

```ts
@Req() req: Request
```

2. Res (injects response object)

```ts
@Res() res: Response
```

3. Next (injects next function)

```ts
@Next() next: NextFunction
```

# Middlewares:

As for middlewares, you can apply them to Controllers or handlers / methods of controllers like this.

```ts
const permission: RequestHandler = (req, res, next) => {
    console.log("passing permission check")
    next()
}
const logger: RequestHandler = (req, res, next) => {
    console.log(req.baseUrl)
    next()
}
const auth: RequestHandler = (req, res, next) => {
    console.log("passing user authentication")
    next()
}

@Controller("/api/users")
@Middlewares(logger)
class Test {
    constructor(private readonly userService: UserService) {}

    @Get("/")
    @Middlewares(auth, permission)
    public async getUser(req: Request, res: Response) {
        const user = await this.userService.getUser()
        return user
    }
}
```

These are normal express middlewares and can have customized implementation as per your needs.
To be straight forward, you can pass your existing middlewares to @Middleware decorator
and apply it to either methods / controllers.
For global middlwares, you can simple use 
```ts
@App({ port: PORT, middlewares: [express.json(), cors()] })
```

# Circular Dependencies:

In case of circular dependencies, you will notice that circular property that gets executed first will be undefined
If you ever come across such a case, where you just have to manage circular dependencies, use @Lazy("type:string").

here is an example:

user.service.ts
```ts
@Component()
class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    public async getUser() {
        return await this.userRepo.getUser()
    }
}

export default UserService
```

user.repository.ts
```ts
@Component()
class UserRepository {
    @Lazy("UserService") private userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }
    
    public async getUser() {
        return { id: 1, name: "Mehdi" }
    }
}

export default UserRepository
```

OR

user.repository.ts
```ts
@Component()
class UserRepository {
    constructor(@Lazy("UserService", "userService") private userService: UserService) {}
    
    public async getUser() {
        return { id: 1, name: "Mehdi" }
    }
}

export default UserRepository
```

@Lazy is fully safe to use now, but it is good to refactor sometimes because circular dependency can also come from a
poor design.

# Exceptions

Exceptions can be handy, and you can control status codes, with messages that are thrown.
you can throw these exceptions in controllers, services or repositories.
It is not recommended to thorw these in middlewares because they currently don't have support for handling them.

1. BadRequestException
2. NotFoundException
3. UnauthorizedException
4. ForbiddenException
5. CustomException

```ts
import { BadRequestException } from 'sams-ts/core'

// Throws error with status 404 and message passed to its constructor.
throw new BadRequestException("something was bad")
```

You can expect this response when above exception is thrown:

```ts
// It will have a status code of 400
{ message: "something was bad" }
```

As for CustomException, you have to pass both `message` and `status` as constructor parameters.
thus giving you control over status code as well.

```ts
import { CustomException } from 'sams-ts/core'

throw new CustomException("something was wrong", 400)
```

# Container Api

The di-container exposes following properties. Try not to mess with them.

## Get Express app

This is the API to access the standard express app instance

```ts
@App({ port: ... })
class App {}

const app = container.app
```

## Get Http Server instance of express app

This method is used to retrieve server instance returned by app.listen method of
express. If you've an app UserApp, you can get its server as:

```ts
@App({ port: ..., })
class App {}

const server = container.server;
```

Now you do different stuff i:e attaching socket.io with it etc.

## container.set - container.get

This is a method that you can manually use to set an instance against a class,
so when that class type is @Autowired, that instance will be injected to it automatically.

```ts
import { DataSource } from "typeorm"
import { container } from "sams-ts/core"

const dataSource = new DataSoruce({ /* options go here */ })
container.set(DataSource, dataSource);
const dataSource = container.get(DataSource) // It will return the data source instance
```

Now you can inject it like this:

```ts
@Component()
class UserRepository {
    constructor(private readonly dataSource: DataSource) {}

    // Use it as you like
}
```
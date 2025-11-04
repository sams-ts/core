
export const getPackagePath = (pkg: string) => {
  try {
    return require.resolve(pkg, { paths: [process.cwd()] })
  } catch {
    return ""
  }
}

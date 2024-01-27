export const verify = (constraintName, condition) => {
  if (!condition) throw new Error(`constraint violated: ${constraintName}`)
}

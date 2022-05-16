export const checkVariableType = (
  variable: any,
  types: string | string[]
): boolean => {
  const checkType = (type: string) => {
    return Object.prototype.toString.call(variable) === `[object ${type}]`
  }

  return Array.isArray(types)
    ? types.some(type => checkType(type))
    : checkType(types)
}

export const isSameType = (...args: any[]): boolean => {
  return new Set(args.map(el => Object.prototype.toString.call(el))).size === 1
}

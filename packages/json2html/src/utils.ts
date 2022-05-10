export const getOwnProtoType = (target: any, type: string): boolean => {
  return Object.prototype.toString.call(target) === `[object ${type}]`
}

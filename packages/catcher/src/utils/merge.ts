import { checkVariableType, isSameType } from './check'

export const merge = (data: any, mergeData: any): any => {
  if (!isSameType(data, mergeData)) {
    throw new Error(`${data} and ${mergeData} is not same types, can't merge`)
  }

  if (checkVariableType(data, ['String', 'Number', 'BigInt'])) {
    return data + mergeData
  }

  if (checkVariableType(data, 'Array')) {
    return Array.from(new Set([...data, ...mergeData]))
  }

  if (checkVariableType(data, 'Set')) {
    mergeData.forEach(el => {
      data.add(el)
    })
    return data
  }

  if (checkVariableType(data, 'Map')) {
    mergeData.forEach((val, key) => {
      data.set(key, val)
    })

    return data
  }

  if (checkVariableType(data, 'Object')) {
    return {
      ...data,
      ...mergeData
    }
  }

  return mergeData
}

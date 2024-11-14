export const objectToString = Object.prototype.toString
export const toTypeString = (value) =>
    objectToString.call(value)

export const isArray = Array.isArray
export const isMap = (val) =>
    toTypeString(val) === '[object Map]'
export const isSet = (val) =>
    toTypeString(val) === '[object Set]'

export const isDate = (val) =>
    toTypeString(val) === '[object Date]'
export const isRegExp = (val) =>
    toTypeString(val) === '[object RegExp]'
export const isFunction = (val) =>
    typeof val === 'function'
export const isString = (val) => typeof val === 'string'
export const isSymbol = (val) => typeof val === 'symbol'
export const isObject = (val) =>
    val !== null && typeof val === 'object'
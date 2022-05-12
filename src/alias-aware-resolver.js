import { aliasSeparator } from './define-object-shape'

export const aliasAwareResolver = (source, args, context, info) => {
  const defaultValue = source[info.fieldName]
  const fieldNode = info.fieldNodes[0]
  const alias = fieldNode && fieldNode.alias && fieldNode.alias.value
  if (!alias) return defaultValue

  const aliasValue = alias && source[info.fieldName + aliasSeparator + alias]
  return aliasValue !== undefined ? aliasValue : defaultValue
}

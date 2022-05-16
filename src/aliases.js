import { isEqual } from 'lodash'

// If the same field is requested through multiple aliases,
// we modify the object shape in the following way
// - obj[<fieldName>] => resolver function that looks up the correct key based on the alias
// - obj[<fieldName>$<alias>] => value for alias
// - obj[<fieldName>$] => value for access without alias
const aliasSeparator = '$'

export function getAliasKey(fieldName, alias) {
  return fieldName + aliasSeparator + (alias || '')
}

// We consider siblings conflicting if they access the same field through different aliases.
// For everything other than tables we also check if the args differ.
export function hasConflictingSiblings(node, siblings) {
  return node.type !== 'noop'
    && siblings.some(sibling => (
      sibling !== node
      && sibling.fieldName === node.fieldName
      && sibling.type !== 'noop'
      && sibling.alias !== node.alias
      // Aliases using different args could be nested within aliased tables using the same args,
      // so we need to treat all tables with different aliases as conflicting.
      && (node.type === 'table' || !isEqual(node.args || {}, sibling.args || {}))
    ))
}

// GraphQL's default resolver supports functions instead of values on source[fieldName],
// and will call this function with the information required that we can
// return the correct value for the field's alias
export function resolveAliasValue(args, context, info) {
  if (!info.fieldNodes || !info.fieldNodes[0]) return null
  
  const alias = info.fieldNodes[0].alias && info.fieldNodes[0].alias.value

  // "this" is the source object that contains the aliased field values
  return this[getAliasKey(info.fieldName, alias)]
}

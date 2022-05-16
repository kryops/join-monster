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
// We could also check if the args differ, but this would break cases where aliases using
// different args are nested within aliases using the same args.
export function hasConflictingSiblings(node, siblings) {
  return node.type !== 'noop'
    && siblings.some(sibling => (
      sibling !== node
      && sibling.fieldName === node.fieldName
      && sibling.type !== 'noop'
      && sibling.alias !== node.alias
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

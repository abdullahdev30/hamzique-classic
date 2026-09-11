export const getRelationshipID = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id

    if (typeof id === 'string' || typeof id === 'number') {
      return String(id)
    }
  }

  return undefined
}

export const getOptionLabel = (value: unknown): string | null => {
  if (value && typeof value === 'object' && 'label' in value) {
    const label = (value as { label?: unknown }).label

    return typeof label === 'string' ? label : null
  }

  return null
}

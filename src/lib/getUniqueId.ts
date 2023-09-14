const lastScopesIds: Record<string, number> = {};

const getUniqueId = (scope = 'unknown') => {
  const nextId = (lastScopesIds[scope] ?? 0) + 1;
  lastScopesIds[scope] = nextId;
  return `awai\$${scope}\$${nextId}`;
};

export default getUniqueId;

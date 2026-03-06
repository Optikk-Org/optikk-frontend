import { domainRegistry } from './domainRegistry';

export const permissionRegistry = Object.freeze(
  domainRegistry.reduce<Record<string, readonly string[]>>((accumulator, domain) => {
    accumulator[domain.key] = domain.permissions;
    return accumulator;
  }, {}),
);

export function getDomainPermissions(domainKey: string): readonly string[] {
  return permissionRegistry[domainKey] || [];
}

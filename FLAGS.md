# Feature Flag Override Hierarchy

This document explains the source-of-truth priority for evaluating dynamic feature flags via `useFeatureFlag(flag)`.
If you are wondering why a feature is enabled locally but disabled in production, consult this hierarchy.

## 1. LocalStorage Override (Developer / Highest Priority)

LocalStorage always wins. This guarantees local developers or QA can force a feature `ON` or `OFF` locally to build/test UI components, disregarding what the backend dictates for the current authenticated organization.

- Mechanism: `localStorage.getItem('flag:[name]') === 'true'`
- Example console execution: `localStorage.setItem('flag:newTraceView', 'true')`
- To clear override: `localStorage.removeItem('flag:newTraceView')`

## 2. Tenant JWT Payload (Production Default)

In production, the backend is the source of truth and dictates feature availability dynamically through the authenticated `/me` or session token payload. The explicitly activated flags are piped down into `tenant.features`.

- Mechanism: `tenant.features.includes(flagName)`

If a local override does not explicitly exist, the frontend implicitly falls back to what the backend permits.

import 'vitest'

// vitest-axe 0.1 types the matcher for an older Vitest namespace; register it for the current API.
interface AxeMatchers {
  toHaveNoViolations(): void
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

/**
 * The axios interceptor unwraps the API envelope { status, code, data } → data.
 * But orval generates types that still describe the envelope.
 * This helper casts hook data to its actual runtime type (the inner data).
 */
export function unwrapApi<D>(
  data: { data: { data?: D } } | undefined,
): D | undefined {
  return data as unknown as D | undefined;
}

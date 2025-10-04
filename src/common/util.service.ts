// util.service.ts
export class UtilService {
  static normalizeOptionalEmptyStrings<T extends Record<string, any>, K extends keyof T>(
    request: T,
    optionalKeys: K[],
  ): T {  // <- pastikan return type T
    const result = { ...request };
    for (const key of optionalKeys) {
      if (typeof result[key] === 'string' && (result[key] as string).trim() === '') {
        result[key] = undefined as unknown as T[K];
      }
    }
    return result;
  }
}

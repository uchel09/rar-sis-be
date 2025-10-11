// util.service.ts
export class UtilService {
  static normalizeOptionalEmptyStrings<
    T extends Record<string, any>,
    K extends keyof T,
  >(request: T, optionalKeys: K[]): T {
    // <- pastikan return type T
    const result = { ...request };
    for (const key of optionalKeys) {
      if (
        typeof result[key] === 'string' &&
        (result[key] as string).trim() === ''
      ) {
        result[key] = undefined as unknown as T[K];
      }
    }
    return result;
  }

  static normalizeOptionalEmptyStrings2<
    T extends Record<string, any>,
    K extends keyof T,
  >(request: T, optionalKeys: K[]): T {
    const result = { ...request };

    for (const key of optionalKeys) {
      const value = result[key];

      // Jika string kosong atau null, hapus field-nya
      if (
        value === null ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (typeof value === 'string' && value.trim() === '')
      ) {
        delete result[key];
      }
    }

    return result;
  }
}

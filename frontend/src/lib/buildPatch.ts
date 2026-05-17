/**
 * Constroi um patch parcial a partir de `values` + `dirtyFields` do React Hook Form.
 *
 * dirtyFields do RHF e uma arvore com `true` em folhas alteradas e `{...}`
 * em ramos parcialmente alterados (ex: `{ attributes: { forca: true } }`).
 * Caminhamos recursivamente, copiando para o resultado APENAS os valores
 * cujo caminho aparece em dirtyFields.
 *
 * Usado pelo auto-save que dispara PATCH /characters/{id} com payload de ~30B
 * (ex: `{name: "X"}`) em vez de PUT do agregado inteiro (~10KB).
 *
 * Generico: vale pra qualquer objeto, nao so CharacterSheet.
 */
type DirtyShape = boolean | { [key: string]: DirtyShape | undefined };

export function buildPatch<T extends object>(
  values: T,
  dirtyFields: Partial<Record<keyof T, DirtyShape>>,
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(dirtyFields) as Array<keyof T>) {
    const dirty = dirtyFields[key];
    const value = values[key];
    if (dirty === true) {
      result[key] = value;
    } else if (typeof dirty === 'object' && dirty !== null && typeof value === 'object' && value !== null) {
      // Recursao em sub-objetos (attributes, status, expertise, actionPool).
      result[key] = buildPatch(
        value as unknown as object,
        dirty as unknown as Partial<Record<keyof object, DirtyShape>>,
      ) as T[keyof T];
    }
  }
  return result;
}

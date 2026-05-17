/**
 * Constroi um patch parcial a partir de `values` + `dirtyFields` do React Hook Form.
 *
 * dirtyFields do RHF e uma arvore com `true` em folhas alteradas e `{...}`
 * em ramos parcialmente alterados (ex: `{ attributes: { forca: true } }`).
 * Caminhamos recursivamente, copiando para o resultado APENAS os valores
 * cujo caminho aparece em dirtyFields.
 *
 * Arrays sao ignorados — a tipagem do RHF marca dirty em arrays como `boolean[]`,
 * mas mutations dedicadas (POST/PUT/DELETE em /attacks, /abilities, /items) ja
 * gerenciam essas listas; o patch nao deve toca-las.
 *
 * Usado pelo auto-save que dispara PATCH /characters/{id} com payload de ~30B
 * (ex: `{name: "X"}`) em vez de PUT do agregado inteiro (~10KB).
 *
 * `any` em dirtyFields/values e intencional: o helper e puro/recursivo e tipar
 * estritamente exigiria mapped types muito complexos que conflitam com a forma
 * que o RHF representa dirty de arrays.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export function buildPatch<T extends object>(
  values: T,
  dirtyFields: AnyRecord,
): Partial<T> {
  const result: AnyRecord = {};
  for (const key of Object.keys(dirtyFields)) {
    const dirty = dirtyFields[key];
    const value = (values as AnyRecord)[key];
    if (dirty === true) {
      result[key] = value;
    } else if (
      typeof dirty === 'object' &&
      dirty !== null &&
      !Array.isArray(dirty) &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Recursao em sub-objetos (attributes, status, expertise, actionPool).
      // Arrays sao puladas (listas gerenciadas por mutations dedicadas).
      result[key] = buildPatch(value, dirty);
    }
  }
  return result as Partial<T>;
}

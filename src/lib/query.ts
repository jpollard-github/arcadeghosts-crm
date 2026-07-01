export type SearchParamValue = string | string[] | undefined;

export function getSingleSearchParam(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

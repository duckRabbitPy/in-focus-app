export function generateShortId(length = 4): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function arrayFromQueryParam(
  param: string | string[] | undefined,
  delimiter: string = ","
): string[] {
  if (!param) {
    return [];
  }

  if (typeof param === "string") {
    return param.split(delimiter).map((item) => item.trim());
  }

  if (Array.isArray(param)) {
    return param.map((item) => (typeof item === "string" ? item.trim() : ""));
  }

  return [];
}

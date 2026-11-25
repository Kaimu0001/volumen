const pad = (n: number) => String(n).padStart(2, '0');

/** 2026.11.20 形式。UTC基準で扱い、実行環境のタイムゾーンで日がずれないようにする */
export function formatDate(date: Date): string {
  return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;
}

/** datetime 属性・JSON-LD 用の YYYY-MM-DD */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

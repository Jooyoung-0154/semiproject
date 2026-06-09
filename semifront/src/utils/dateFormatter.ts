export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '';
  const normalized = dateString
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/, '$1T$2');
  let parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(`${normalized}Z`);
  }
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleString();
}

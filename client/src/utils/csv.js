function csvValue(value) {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date
    ? value.toISOString()
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  const safeText = /^[\u0000-\u0020]*[=+@]/.test(text)
    || /^[\u0000-\u0020]*-(?!\d)/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replaceAll('"', '""')}"`;
}

export function serializeCsv(fields, records) {
  const header = fields.map(([, label]) => csvValue(label)).join(',');
  const rows = records.map((record) => fields
    .map(([key]) => csvValue(record[key]))
    .join(','));

  return `\uFEFF${[header, ...rows].join('\r\n')}`;
}

export function downloadCsv(filename, fields, records) {
  const blob = new Blob([serializeCsv(fields, records)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

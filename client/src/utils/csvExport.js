// src/utils/csvExport.js

/**
 * Converts an array of objects to CSV and triggers a download in the browser.
 * @param {Array<Object>} data
 * @param {string} filename
 */
export function exportToCSV(data, filename = 'data.csv') {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(field => {
        const val = row[field] ?? '';
        // Escape quotes and commas
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
}

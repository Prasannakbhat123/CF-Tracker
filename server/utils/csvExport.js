const { Parser } = require('json2csv');

/**
 * Converts an array of objects to CSV format.
 */
function exportToCSV(data, fields) {
  const parser = new Parser({ fields });
  return parser.parse(data);
}

module.exports = { exportToCSV };

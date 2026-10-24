const fs = require('fs');
const path = require('path');
const { dataDir } = require('../config');

/** Tiny JSON-file "table": every collection is an array stored in data/<name>.json. */
function collection(name) {
  const file = path.join(dataDir, `${name}.json`);

  function all() {
    if (!fs.existsSync(file)) return [];
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save(rows) {
    // Write to a temp file first so a crash can never leave a half-written JSON file.
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(rows, null, 2));
    fs.renameSync(tmp, file);
  }

  return { all, save };
}

module.exports = {
  users: collection('users'),
  products: collection('products'),
  offers: collection('offers'),
  orders: collection('orders'),
};

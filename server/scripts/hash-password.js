// Usage: npm run hash-password -- "my secret"
// Prints a hash that can be pasted into data/users.json.
const { hashPassword } = require('../src/lib/password');

const plain = process.argv[2];
if (!plain) {
  console.error('Usage: npm run hash-password -- "<password>"');
  process.exit(1);
}
console.log(hashPassword(plain));

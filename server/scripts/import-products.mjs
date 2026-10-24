// Rebuilds data/products.json from the public DummyJSON catalogue (Node 18+, no extra packages).
//   npm run import:products
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const target = fileURLToPath(new URL('../data/products.json', import.meta.url));

const response = await fetch('https://dummyjson.com/products?limit=0');
if (!response.ok) throw new Error(`DummyJSON answered with HTTP ${response.status}`);

const { products } = await response.json();
const catalogue = products.map(p => ({
  productId: String(p.id),
  productTitle: p.title,
  productPrice: p.price,
  productQuantity: p.stock,
  productImage: p.thumbnail,
  productCategory: p.category,
  restockDate: null,
}));

await writeFile(target, JSON.stringify(catalogue, null, 2));
console.log(`Saved ${catalogue.length} products to ${target}`);

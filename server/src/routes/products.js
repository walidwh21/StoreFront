const { Router } = require('express');
const store = require('../lib/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', (_req, res) => {
  res.json(store.products.all());
});

router.get('/:id', (req, res) => {
  const product = store.products.all().find(p => p.productId === req.params.id);
  if (!product) return res.status(404).send('Product not found.');
  res.json(product);
});

// Admin: restock. A quantity of 0 empties the stock, any other value is added to it.
router.put('/:id/stock', requireAuth, requireAdmin, (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).send('Quantity must be a non-negative integer.');
  }

  const products = store.products.all();
  const product = products.find(p => p.productId === req.params.id);
  if (!product) return res.status(404).send('Product not found.');

  if (quantity === 0) {
    product.productQuantity = 0;
    product.restockDate = null;
  } else {
    product.productQuantity += quantity;
    product.restockDate = new Date().toISOString();
  }

  store.products.save(products);
  res.json(product);
});

module.exports = router;

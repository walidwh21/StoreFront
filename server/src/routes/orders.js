const { Router } = require('express');
const { randomUUID } = require('crypto');
const store = require('../lib/store');
const { requireAuth } = require('../middleware/auth');

const router = Router();

const isAdmin = req => req.user.userType === 'admin';
const canSee = (req, ownerId) => isAdmin(req) || req.user.userId === ownerId;

router.post('/', requireAuth, (req, res) => {
  const { items, paymentMethod, deliveryAddress, shippingFee, totalPrice } = req.body;

  if (!Array.isArray(items) || items.length === 0 || !paymentMethod || !deliveryAddress) {
    return res.status(400).send('Invalid order data.');
  }

  const products = store.products.all();

  // Check every line before touching the stock so a failure leaves nothing half-applied.
  for (const item of items) {
    const product = products.find(p => p.productId === item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: 'Invalid item in order.' });
    }
    if (product.productQuantity < item.quantity) {
      return res.status(400).json({ message: 'Insufficient stock for one of the products.' });
    }
  }
  for (const item of items) {
    products.find(p => p.productId === item.productId).productQuantity -= item.quantity;
  }
  store.products.save(products);

  const order = {
    orderId: randomUUID(),
    userId: req.user.userId, // always the signed-in user, never a client-supplied id
    items,
    paymentMethod,
    deliveryAddress,
    shippingFee,
    totalPrice,
    orderDate: new Date().toISOString(),
    status: 'pending',
  };
  const orders = store.orders.all();
  orders.push(order);
  store.orders.save(orders);

  res.status(201).json({ message: 'Order successfully recorded.', orderId: order.orderId });
});

router.get('/user/:userId', requireAuth, (req, res) => {
  if (!canSee(req, req.params.userId)) return res.status(403).send('Access denied.');
  res.json(store.orders.all().filter(o => o.userId === req.params.userId));
});

router.get('/:orderId', requireAuth, (req, res) => {
  const order = store.orders.all().find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!canSee(req, order.userId)) return res.status(403).send('Access denied.');
  res.json(order);
});

module.exports = router;

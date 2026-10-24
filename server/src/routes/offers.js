const { Router } = require('express');
const { randomUUID } = require('crypto');
const store = require('../lib/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();
const OFFER_TYPES = ['special offer', 'promotion', 'discount'];

router.get('/', (_req, res) => {
  res.json(store.offers.all());
});

router.get('/:id', (req, res) => {
  const offer = store.offers.all().find(o => o.id === req.params.id);
  if (!offer) return res.status(404).send('Offer not found.');
  res.json(offer);
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { title, description, discountPercent, startDate, endDate, active, type, productIds } = req.body;

  const valid =
    title &&
    typeof discountPercent === 'number' && discountPercent > 0 && discountPercent <= 100 &&
    startDate && endDate &&
    OFFER_TYPES.includes(type) &&
    Array.isArray(productIds);
  if (!valid) return res.status(400).send('Required fields are missing or invalid.');

  const offer = {
    id: randomUUID(),
    title,
    description: description || '',
    discountPercent,
    startDate,
    endDate,
    active: active ?? true,
    type,
    productIds,
  };

  const offers = store.offers.all();
  offers.push(offer);
  store.offers.save(offers);
  res.status(201).json(offer);
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const offers = store.offers.all();
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).send('Offer not found.');

  offers[index] = { ...offers[index], ...req.body, id: offers[index].id };
  store.offers.save(offers);
  res.json(offers[index]);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const offers = store.offers.all();
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).send('Offer not found.');

  const [deleted] = offers.splice(index, 1);
  store.offers.save(offers);
  res.json({ message: 'Offer deleted.', deleted });
});

module.exports = router;

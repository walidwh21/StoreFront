const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { clientOrigin } = require('./config');

const app = express();

app.use(cors({ origin: clientOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));

app.use((_req, res) => res.status(404).send('Not found.'));

module.exports = app;

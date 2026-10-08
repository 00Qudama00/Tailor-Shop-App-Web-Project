const express = require('express');
const auth = require('../middleware/auth');

const NOT_READY = 'This feature is not implemented yet. It will be available in the next phase.';

function notImplemented(req, res) {
  res.status(501).json({ message: NOT_READY });
}

function notFound(label) {
  return (req, res) => res.status(404).json({ message: `${label} not found.` });
}

// a router where only the listed reads answer, everything else is 501
function placeholder(reads) {
  const router = express.Router();
  router.use(auth);
  reads(router);
  router.all('/{*rest}', notImplemented);
  return router;
}

function emptyDashboard(req, res) {
  const now = new Date();
  const chart = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chart.push({ month: month.toLocaleString('en-US', { month: 'short' }), sales: 0, expenses: 0 });
  }
  res.json({
    customers: 0,
    employees: 0,
    pending: 0,
    urgent: 0,
    overdue: 0,
    ready: 0,
    balanceDue: 0,
    monthSales: 0,
    monthOrders: 0,
    monthExpenses: 0,
    chart,
    dueSoon: [],
    recentOrders: [],
  });
}

// public tracking link has no login
const trackRouter = express.Router();
trackRouter.get('/track/:id', notFound('Order'));

const ordersRouter = placeholder((r) => {
  r.get('/', (req, res) => res.json([]));
  r.get('/cleanup', (req, res) => res.json({ total: 0, delivered: 0, pending: 0, eligible: 0 }));
  r.get('/:id', notFound('Order'));
});

module.exports = {
  shop: (() => {
    const router = express.Router();
    router.put('/shop', auth, notImplemented);
    return router;
  })(),
  orders: [trackRouter, ordersRouter],
  customers: placeholder((r) => {
    r.get('/', (req, res) => res.json([]));
    r.get('/:id', notFound('Customer'));
  }),
  employees: placeholder((r) => {
    r.get('/', (req, res) => res.json([]));
    r.get('/:id', notFound('Employee'));
  }),
  suitTypes: placeholder((r) => {
    r.get('/', (req, res) => res.json([]));
  }),
  expenses: placeholder((r) => {
    r.get('/', (req, res) => res.json({ expenses: [], total: 0 }));
  }),
  dashboard: placeholder((r) => {
    r.get('/', emptyDashboard);
  }),
};

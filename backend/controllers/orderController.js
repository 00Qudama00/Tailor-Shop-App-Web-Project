const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const SuitType = require('../models/SuitType');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { escapeRegex, toNumber, startOfToday, parseDate } = require('../utils/helpers');

const PENDING = ['Cutting', 'Stitching'];

async function buildItems(userId, items, oldItems = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Add at least one suit to the order.');
  }

  const result = [];
  for (const item of items) {
    const suitType = await SuitType.findOne({ _id: item.suitType, user: userId });
    if (!suitType) throw new Error('Please select a valid suit type for every item.');

    let employeeId = null;
    if (item.employee) {
      const employee = await Employee.findOne({ _id: item.employee, user: userId });
      if (!employee) throw new Error('Selected employee was not found.');
      employeeId = employee._id;
    }

    const old = oldItems.find((o) => item.id && String(o._id) === String(item.id));

    result.push({
      suitType: suitType._id,
      suitTypeName: suitType.name,
      employee: employeeId,
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      price: toNumber(item.price),
      employeeSalary: toNumber(item.employeeSalary),
      isPaidToEmployee: old ? old.isPaidToEmployee : false,
    });
  }
  return result;
}

function applyTotals(order) {
  order.totalSuits = order.items.reduce((sum, i) => sum + i.quantity, 0);
  order.totalPrice = order.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  order.totalSalary = order.items.reduce((sum, i) => sum + i.quantity * i.employeeSalary, 0);
  if (order.advancePaid > order.totalPrice) order.advancePaid = order.totalPrice;
}

function applyStage(order, stage, receivedBy) {
  order.stage = stage;
  if (stage === 'Cutting' || stage === 'Stitching') {
    order.readyDate = null;
    order.deliveredDate = null;
    order.receivedBy = '';
  }
  if (stage === 'Ready') {
    order.readyDate = order.readyDate || new Date();
    order.deliveredDate = null;
    order.receivedBy = '';
  }
  if (stage === 'Delivered') {
    order.readyDate = order.readyDate || new Date();
    order.deliveredDate = new Date();
    order.receivedBy = receivedBy || 'Customer';
    order.advancePaid = order.totalPrice;
  }
}

function statusFilter(status) {
  switch (status) {
    case 'pending':
      return { stage: { $in: PENDING } };
    case 'urgent':
      return { stage: { $in: PENDING }, isUrgent: true };
    case 'overdue':
      return { stage: { $in: PENDING }, dueDate: { $lt: startOfToday() } };
    case 'ready':
      return { stage: 'Ready' };
    case 'delivered':
      return { stage: 'Delivered' };
    default:
      return {};
  }
}

exports.getAll = async (req, res) => {
  const filter = { user: req.userId, ...statusFilter(req.query.status) };
  const search = (req.query.search || '').trim();

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    const customers = await Customer.find({ user: req.userId, $or: [{ name: regex }, { phone: regex }] }).select('_id');
    filter.$or = [{ customer: { $in: customers.map((c) => c._id) } }];
    if (!isNaN(search)) filter.$or.push({ orderNo: Number(search) });
  }

  let sort = { orderNo: -1 };
  if (req.query.status === 'delivered') sort = { deliveredDate: -1 };
  else if (req.query.status) sort = { dueDate: 1 };

  const orders = await Order.find(filter).populate('customer', 'name phone regNo').sort(sort);
  res.json(orders);
};

exports.getOne = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId })
    .populate('customer')
    .populate('items.employee', 'name');
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  res.json(order);
};

exports.create = async (req, res) => {
  const body = req.body;
  const customer = await Customer.findOne({ _id: body.customer, user: req.userId });
  if (!customer) {
    return res.status(400).json({ message: 'Please select a customer.' });
  }
  if (!body.dueDate) {
    return res.status(400).json({ message: 'Please select a due date.' });
  }

  let items;
  try {
    items = await buildItems(req.userId, body.items);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const last = await Order.findOne({ user: req.userId }).sort({ orderNo: -1 });

  const order = new Order({
    user: req.userId,
    orderNo: last ? last.orderNo + 1 : 1,
    customer: customer._id,
    dueDate: parseDate(body.dueDate),
    items,
    advancePaid: toNumber(body.advancePaid),
    isUrgent: Boolean(body.isUrgent),
    collarType: body.collarType || '',
    cuffType: body.cuffType || '',
    pocketType: body.pocketType || '',
    damanType: body.damanType || '',
    fabricPhoto: body.fabricPhoto || '',
    audioNote: body.audioNote || '',
    notes: body.notes || '',
  });

  applyTotals(order);
  await order.save();
  res.status(201).json(order);
};

exports.update = async (req, res) => {
  const body = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const customer = await Customer.findOne({ _id: body.customer, user: req.userId });
  if (!customer) {
    return res.status(400).json({ message: 'Please select a customer.' });
  }

  try {
    order.items = await buildItems(req.userId, body.items, order.items);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  order.customer = customer._id;
  if (body.dueDate) order.dueDate = parseDate(body.dueDate);
  order.advancePaid = toNumber(body.advancePaid);
  order.isUrgent = Boolean(body.isUrgent);
  order.collarType = body.collarType || '';
  order.cuffType = body.cuffType || '';
  order.pocketType = body.pocketType || '';
  order.damanType = body.damanType || '';
  order.fabricPhoto = body.fabricPhoto || '';
  order.audioNote = body.audioNote || '';
  order.notes = body.notes || '';

  applyTotals(order);
  await order.save();
  res.json(order);
};

exports.remove = async (req, res) => {
  const order = await Order.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  res.json({ message: 'Order deleted.' });
};

exports.updateStage = async (req, res) => {
  const { stage, receivedBy } = req.body;
  if (!Order.STAGES.includes(stage)) {
    return res.status(400).json({ message: 'Invalid stage.' });
  }

  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  applyStage(order, stage, receivedBy);
  await order.save();
  res.json(order);
};

exports.addPayment = async (req, res) => {
  const amount = toNumber(req.body.amount);
  if (amount <= 0) {
    return res.status(400).json({ message: 'Enter a valid amount.' });
  }

  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  order.advancePaid = Math.min(order.totalPrice, order.advancePaid + amount);
  await order.save();
  res.json(order);
};

exports.upload = (req, res) => {
  const files = req.files || {};
  res.json({
    fabricPhoto: files.fabricPhoto ? '/uploads/' + files.fabricPhoto[0].filename : '',
    audioNote: files.audioNote ? '/uploads/' + files.audioNote[0].filename : '',
  });
};

exports.track = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Order not found. Please check your tracking link.' });
  }

  const order = await Order.findById(req.params.id).populate('customer', 'name');
  if (!order) {
    return res.status(404).json({ message: 'Order not found. Please check your tracking link.' });
  }

  const shop = await User.findById(order.user);
  res.json({
    orderNo: order.orderNo,
    customerName: order.customer ? order.customer.name : '',
    orderDate: order.orderDate,
    dueDate: order.dueDate,
    stage: order.stage,
    isUrgent: order.isUrgent,
    totalSuits: order.totalSuits,
    totalPrice: order.totalPrice,
    advancePaid: order.advancePaid,
    balance: order.balance,
    items: order.items.map((i) => ({ name: i.suitTypeName, quantity: i.quantity })),
    shopName: shop ? shop.shopName : 'Tailor Shop',
    shopPhone: shop ? shop.shopPhone : '',
    shopLogo: shop ? shop.logo : '',
  });
};

exports.cleanupStats = async (req, res) => {
  const years = parseInt(req.query.years, 10) || 2;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);

  const [total, delivered, eligible] = await Promise.all([
    Order.countDocuments({ user: req.userId }),
    Order.countDocuments({ user: req.userId, stage: 'Delivered' }),
    Order.countDocuments({ user: req.userId, stage: 'Delivered', deliveredDate: { $lt: cutoff } }),
  ]);

  res.json({ total, delivered, pending: total - delivered, eligible });
};

exports.cleanup = async (req, res) => {
  const years = parseInt(req.body.years, 10);
  if (!years || years < 1) {
    return res.status(400).json({ message: 'Please choose how many years to keep.' });
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);

  const result = await Order.deleteMany({ user: req.userId, stage: 'Delivered', deliveredDate: { $lt: cutoff } });
  res.json({ message: `${result.deletedCount} old orders deleted.`, deleted: result.deletedCount });
};

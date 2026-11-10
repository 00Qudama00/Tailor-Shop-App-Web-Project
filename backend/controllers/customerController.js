const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { escapeRegex } = require('../utils/helpers');

const MEASUREMENT_FIELDS = [
  'qameezLambai', 'chaati', 'kamar', 'teera', 'baazu', 'collar', 'qameezGhera',
  'moda', 'kuff', 'shalwarLambai', 'pancha', 'shalwarGhera', 'aasan',
];

exports.getAll = async (req, res) => {
  const filter = { user: req.userId };
  const search = (req.query.search || '').trim();

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { phone: regex }];
    if (!isNaN(search)) filter.$or.push({ regNo: Number(search) });
  }

  const customers = await Customer.find(filter).sort({ regNo: -1 });
  res.json(customers);
};

exports.getOne = async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, user: req.userId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const orders = await Order.find({ customer: customer._id }).sort({ orderDate: -1 });
  res.json({ customer, orders });
};

exports.create = async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone number are required.' });
  }

  const last = await Customer.findOne({ user: req.userId }).sort({ regNo: -1 });
  const regNo = last ? last.regNo + 1 : 1;

  const customer = await Customer.create({ user: req.userId, regNo, name, phone, address });
  res.status(201).json(customer);
};

exports.update = async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone number are required.' });
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { name, phone, address },
    { new: true }
  );
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  res.json(customer);
};

exports.remove = async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }
  await Order.deleteMany({ customer: customer._id });
  res.json({ message: 'Customer and their orders deleted.' });
};

exports.saveMeasurement = async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, user: req.userId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const measurement = { notes: req.body.notes || '' };
  MEASUREMENT_FIELDS.forEach((field) => {
    const value = parseFloat(req.body[field]);
    measurement[field] = isNaN(value) ? null : value;
  });

  customer.measurement = measurement;
  await customer.save();
  res.json(customer);
};

const Employee = require('../models/Employee');
const Order = require('../models/Order');
const SuitType = require('../models/SuitType');
const Expense = require('../models/Expense');
const { toNumber } = require('../utils/helpers');

const DONE_STAGES = ['Ready', 'Delivered'];

async function getUnpaidWork(userId, employeeId) {
  const filter = { user: userId, stage: { $in: DONE_STAGES }, 'items.isPaidToEmployee': false };
  if (employeeId) filter['items.employee'] = employeeId;

  const orders = await Order.find(filter).populate('customer', 'name regNo').sort({ readyDate: -1 });
  const work = [];

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!item.employee || item.isPaidToEmployee) return;
      if (employeeId && String(item.employee) !== String(employeeId)) return;
      work.push({
        orderId: order.id,
        orderNo: order.orderNo,
        customerName: order.customer ? order.customer.name : '-',
        employee: String(item.employee),
        suitTypeName: item.suitTypeName,
        quantity: item.quantity,
        amount: item.quantity * item.employeeSalary,
        readyDate: order.readyDate,
      });
    });
  });

  return work;
}

exports.getAll = async (req, res) => {
  const employees = await Employee.find({ user: req.userId }).sort({ name: 1 });
  const work = await getUnpaidWork(req.userId);

  const result = employees.map((emp) => {
    const mine = work.filter((w) => w.employee === emp.id);
    return {
      ...emp.toJSON(),
      pendingSuits: mine.reduce((sum, w) => sum + w.quantity, 0),
      pendingAmount: mine.reduce((sum, w) => sum + w.amount, 0),
    };
  });

  res.json(result);
};

exports.getOne = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, user: req.userId });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }

  const suitTypes = await SuitType.find({ user: req.userId }).sort({ createdAt: 1 });
  const rates = suitTypes.map((st) => {
    const custom = employee.rates.find((r) => String(r.suitType) === st.id);
    return {
      suitTypeId: st.id,
      name: st.name,
      defaultSalary: st.employeeSalary,
      salary: custom ? custom.salary : st.employeeSalary,
      isCustom: Boolean(custom),
    };
  });

  const unpaidWork = await getUnpaidWork(req.userId, employee._id);
  const payments = await Expense.find({ user: req.userId, employee: employee._id }).sort({ date: -1 }).limit(20);
  res.json({ employee, rates, unpaidWork, payments });
};

exports.create = async (req, res) => {
  const { name, phone, position } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Employee name is required.' });
  }

  const employee = await Employee.create({ user: req.userId, name, phone, position: position || 'Tailor' });
  res.status(201).json(employee);
};

exports.update = async (req, res) => {
  const { name, phone, position } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Employee name is required.' });
  }

  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { name, phone, position },
    { new: true }
  );
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }
  res.json(employee);
};

exports.remove = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, user: req.userId });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }

  const work = await getUnpaidWork(req.userId, employee._id);
  if (work.length > 0) {
    return res.status(400).json({ message: `Please pay ${employee.name}'s pending salary before removing them.` });
  }

  await employee.deleteOne();
  res.json({ message: 'Employee deleted.' });
};

exports.setRate = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, user: req.userId });
  const suitType = await SuitType.findOne({ _id: req.params.suitTypeId, user: req.userId });
  if (!employee || !suitType) {
    return res.status(404).json({ message: 'Employee or suit type not found.' });
  }

  const salary = toNumber(req.body.salary);
  const existing = employee.rates.find((r) => String(r.suitType) === suitType.id);

  if (existing) {
    existing.salary = salary;
  } else {
    employee.rates.push({ suitType: suitType._id, salary });
  }

  await employee.save();
  res.json({ message: 'Rate saved.' });
};

exports.paySalary = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, user: req.userId });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }

  const work = await getUnpaidWork(req.userId, employee._id);
  const amount = work.reduce((sum, w) => sum + w.amount, 0);
  if (amount === 0) {
    return res.status(400).json({ message: 'There is no unpaid work for this kareegar.' });
  }

  await Order.updateMany(
    { user: req.userId, stage: { $in: DONE_STAGES }, 'items.employee': employee._id },
    { $set: { 'items.$[item].isPaidToEmployee': true } },
    { arrayFilters: [{ 'item.employee': employee._id, 'item.isPaidToEmployee': false }] }
  );

  // the payment is also saved as a shop expense so the monthly profit stays correct
  const suits = work.reduce((sum, w) => sum + w.quantity, 0);
  await Expense.create({
    user: req.userId,
    description: `Salary - ${employee.name} (${suits} suits)`,
    amount,
    category: 'Salary',
    employee: employee._id,
  });

  res.json({ message: `Paid Rs ${amount.toLocaleString()} to ${employee.name}.` });
};

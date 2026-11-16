const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const Expense = require('../models/Expense');
const { startOfToday } = require('../utils/helpers');

const PENDING = ['Cutting', 'Stitching'];

exports.getStats = async (req, res) => {
  const user = req.userId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [customers, employees, pending, urgent, overdue, ready, orders, expenses, dueSoon, recentOrders] =
    await Promise.all([
      Customer.countDocuments({ user }),
      Employee.countDocuments({ user }),
      Order.countDocuments({ user, stage: { $in: PENDING } }),
      Order.countDocuments({ user, stage: { $in: PENDING }, isUrgent: true }),
      Order.countDocuments({ user, stage: { $in: PENDING }, dueDate: { $lt: startOfToday() } }),
      Order.countDocuments({ user, stage: 'Ready' }),
      Order.find({ user, orderDate: { $gte: sixMonthsAgo } }),
      Expense.find({ user, date: { $gte: sixMonthsAgo } }),
      Order.find({ user, stage: { $in: PENDING } }).populate('customer', 'name phone').sort({ dueDate: 1 }).limit(6),
      Order.find({ user }).populate('customer', 'name').sort({ createdAt: -1 }).limit(6),
    ]);

  const openOrders = await Order.find({ user, stage: { $ne: 'Delivered' } }).select('totalPrice advancePaid');
  const balanceDue = openOrders.reduce((sum, o) => sum + Math.max(0, o.totalPrice - o.advancePaid), 0);

  const chart = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const inMonth = (date) => date >= start && date < end;

    chart.push({
      month: start.toLocaleString('en-US', { month: 'short' }),
      sales: orders.filter((o) => inMonth(o.orderDate)).reduce((sum, o) => sum + o.totalPrice, 0),
      expenses: expenses.filter((e) => inMonth(e.date)).reduce((sum, e) => sum + e.amount, 0),
    });
  }

  const thisMonthOrders = orders.filter((o) => o.orderDate >= monthStart);
  const thisMonthExpenses = expenses.filter((e) => e.date >= monthStart);

  res.json({
    customers,
    employees,
    pending,
    urgent,
    overdue,
    ready,
    balanceDue,
    monthSales: thisMonthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    monthOrders: thisMonthOrders.length,
    monthExpenses: thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
    chart,
    dueSoon,
    recentOrders,
  });
};

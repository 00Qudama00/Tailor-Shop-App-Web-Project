const Expense = require('../models/Expense');
const { toNumber, parseDate } = require('../utils/helpers');

exports.getAll = async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.category) filter.category = req.query.category;

  if (req.query.month) {
    const [year, month] = req.query.month.split('-').map(Number);
    filter.date = { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) };
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ expenses, total });
};

exports.create = async (req, res) => {
  const { description, amount, category, date } = req.body;
  if (!description || !(toNumber(amount) > 0)) {
    return res.status(400).json({ message: 'Description and a valid amount are required.' });
  }

  const expense = await Expense.create({
    user: req.userId,
    description,
    amount: toNumber(amount),
    category: category || 'General',
    date: parseDate(date),
  });
  res.status(201).json(expense);
};

exports.remove = async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }
  res.json({ message: 'Expense deleted.' });
};

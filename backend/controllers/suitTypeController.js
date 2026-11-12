const SuitType = require('../models/SuitType');
const Employee = require('../models/Employee');
const { toNumber } = require('../utils/helpers');

exports.getAll = async (req, res) => {
  const suitTypes = await SuitType.find({ user: req.userId }).sort({ createdAt: 1 });
  res.json(suitTypes);
};

exports.create = async (req, res) => {
  const { name, price, employeeSalary } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Suit type name is required.' });
  }

  const suitType = await SuitType.create({
    user: req.userId,
    name,
    price: toNumber(price),
    employeeSalary: toNumber(employeeSalary),
  });
  res.status(201).json(suitType);
};

exports.update = async (req, res) => {
  const suitType = await SuitType.findOne({ _id: req.params.id, user: req.userId });
  if (!suitType) {
    return res.status(404).json({ message: 'Suit type not found.' });
  }

  const { name, price, employeeSalary, isActive } = req.body;
  if (name) suitType.name = name;
  if (price !== undefined) suitType.price = toNumber(price);
  if (employeeSalary !== undefined) suitType.employeeSalary = toNumber(employeeSalary);
  if (isActive !== undefined) suitType.isActive = Boolean(isActive);

  await suitType.save();
  res.json(suitType);
};

exports.remove = async (req, res) => {
  const suitType = await SuitType.findOne({ _id: req.params.id, user: req.userId });
  if (!suitType) {
    return res.status(404).json({ message: 'Suit type not found.' });
  }
  if (suitType.isDefault) {
    return res.status(400).json({ message: 'Default suit types cannot be deleted. You can turn them off instead.' });
  }

  await suitType.deleteOne();
  await Employee.updateMany({ user: req.userId }, { $pull: { rates: { suitType: suitType._id } } });
  res.json({ message: 'Suit type deleted.' });
};

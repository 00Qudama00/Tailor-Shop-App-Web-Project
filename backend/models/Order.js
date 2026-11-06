const mongoose = require('mongoose');
const { startOfToday } = require('../utils/helpers');

const STAGES = ['Cutting', 'Stitching', 'Ready', 'Delivered'];

const itemSchema = new mongoose.Schema({
  suitType: { type: mongoose.Schema.Types.ObjectId, ref: 'SuitType' },
  suitTypeName: { type: String, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, default: 0, min: 0 },
  employeeSalary: { type: Number, default: 0, min: 0 },
  isPaidToEmployee: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNo: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: [itemSchema],
    totalSuits: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    totalSalary: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    isUrgent: { type: Boolean, default: false },
    stage: { type: String, enum: STAGES, default: 'Cutting' },
    collarType: { type: String, default: '' },
    cuffType: { type: String, default: '' },
    pocketType: { type: String, default: '' },
    damanType: { type: String, default: '' },
    fabricPhoto: { type: String, default: '' },
    audioNote: { type: String, default: '' },
    notes: { type: String, default: '' },
    readyDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    receivedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, orderNo: 1 }, { unique: true });

orderSchema.virtual('balance').get(function () {
  return Math.max(0, this.totalPrice - this.advancePaid);
});

orderSchema.virtual('isOverdue').get(function () {
  const done = this.stage === 'Ready' || this.stage === 'Delivered';
  return !done && this.dueDate < startOfToday();
});

orderSchema.statics.STAGES = STAGES;

module.exports = mongoose.model('Order', orderSchema);

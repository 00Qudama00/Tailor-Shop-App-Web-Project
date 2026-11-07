const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    suitType: { type: mongoose.Schema.Types.ObjectId, ref: 'SuitType', required: true },
    salary: { type: Number, required: true, min: 0 },
  },
  { _id: false, id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    position: { type: String, default: 'Tailor' },
    rates: [rateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);

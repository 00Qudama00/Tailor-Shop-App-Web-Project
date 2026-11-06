const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
  {
    qameezLambai: Number,
    chaati: Number,
    kamar: Number,
    teera: Number,
    baazu: Number,
    collar: Number,
    qameezGhera: Number,
    moda: Number,
    kuff: Number,
    shalwarLambai: Number,
    pancha: Number,
    shalwarGhera: Number,
    aasan: Number,
    notes: String,
  },
  { _id: false, id: false }
);

const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    regNo: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    measurement: { type: measurementSchema, default: null },
  },
  { timestamps: true }
);

customerSchema.index({ user: 1, regNo: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

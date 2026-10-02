const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    shopName: { type: String, default: 'My Tailor Shop' },
    shopPhone: { type: String, default: '' },
    shopAddress: { type: String, default: '' },
    logo: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

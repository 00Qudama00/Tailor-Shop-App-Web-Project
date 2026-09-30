const mongoose = require('mongoose');

mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tailor_shop';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;

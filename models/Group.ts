import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  owner: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expenses: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true },
    splitBetween: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  paymentRequests: [{
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema); 
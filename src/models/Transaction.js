const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional now because we might have BILL_PAY or WITHDRAW where receiver is not a user
    },
    // New Feature: Keep track of transaction types
    type: {
      type: String,
      enum: [
        'TRANSFER', 'ADD_MONEY', 'WITHDRAW', 'BILL_PAY', 'Bank_Transfer', 'UPI_Transfer', 'Self_Transfer', 'debit',
        'Mobile_Recharge', 'DTH_RECHARGE'
      ],
      default: 'TRANSFER',
    },
    billerName: {
      type: String, // e.g. "Jio Mobile Recharge" or "Adani Electricity"
    },
    name: {
      type: String,
    },
    remark: {
      type: String,
      default: "",
    },
    operator: {
      type: String,
      default: "",
    },
    plans: {
      type: String,
      default: "",
    },
    mobile_no: {
      type: String,
      default: "",
    },
    consumerNumber: {
      type: Number,
      default: "",
    },
    board: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

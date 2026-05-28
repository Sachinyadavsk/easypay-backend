const Transaction = require('../models/Transaction');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Bank = require("../models/Bank");

// @desc    Send money via Phone Number OR UPI ID
// @route   POST /api/transactions/send
// @access  Private
const sendMoney = async (req, res) => {
  try {
    const { receiverIdentifier, amount, mpin } = req.body; // identifier can be Phone OR UPI ID
    const senderId = req.user._id;
    if (!mpin) {
      return res.status(400).json({ message: 'MPIN is required for transactions' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const sender = await User.findById(senderId);
    // Verify MPIN
    if (!sender.mpin) {
      return res.status(400).json({ message: 'Please setup your MPIN first' });
    }
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), sender.mpin);
    if (!isMpinCorrect) {
      return res.status(401).json({ message: 'Incorrect MPIN' });
    }
    // Find the receiver either by Phone or UPI ID
    const receiver = await User.findOne({
      $or: [{ phone: receiverIdentifier }, { upiId: receiverIdentifier }]
    });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found (Invalid Phone/UPI)' });
    }
    if (senderId.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: 'You cannot send money to yourself' });
    }
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    // Transfer Logic
    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    // Log the transaction
    const transaction = await Transaction.create({
      sender: senderId,
      receiver: receiver._id,
      type: 'TRANSFER',
      amount,
      status: 'SUCCESS',
    });

    res.status(201).json({
      message: 'Money Transfer Successful',
      transaction,
      newBalance: sender.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name phone upiId')
      .populate('receiver', 'name phone upiId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Transaction history get successfully',
      status: 'success',
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BANK TRANSFER
const bankTransfer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { bank, accountNumber, ifsc, receiverName, amount, remark, mpin } = req.body;
    if (!bank || !accountNumber || !ifsc || !receiverName || !amount || !mpin) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!mpin) {
      return res.status(400).json({ message: 'MPIN is required for transactions' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Verify MPIN
    if (!user.mpin) {
      return res.status(400).json({ message: 'Please setup your MPIN first' });
    }
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect) {
      return res.status(401).json({ message: 'Incorrect MPIN' });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    // Save Transaction
    const transaction = await Transaction.create({
      sender: user._id,
      type: "Bank_Transfer",
      name: receiverName,
      amount,
      remark,
    });

    res.status(200).json({
      success: true,
      message: "Money transferred successfully",
      transaction,
      balance: user.balance,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Transfer failed",
    });
  }
};

// UPI TRANSFER
const upiTransfer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { upiId, amount, remark, mpin } = req.body;
    if (!upiId || !amount || !mpin) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    if (!mpin) {
      return res.status(400).json({ message: 'MPIN is required for transactions' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Verify MPIN
    if (!user.mpin) {
      return res.status(400).json({ message: 'Please setup your MPIN first' });
    }
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect) {
      return res.status(401).json({ message: 'Incorrect MPIN' });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();

    // Save Transaction
    const transaction = await Transaction.create({
      sender: user._id,
      type: "UPI_Transfer",
      name: upiId,
      amount,
      remark,
    });

    res.status(200).json({
      success: true,
      message: "UPI transfer successful",
      transaction,
      balance: user.balance,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "UPI transfer failed",
    });
  }
};

// SELF TRANSFER
const selfTransfer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { bank, amount, remark, mpin } = req.body;

    // VALIDATION
    if (!bank || !amount || !mpin) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // CHECK MPIN
    if (!user.mpin) {
      return res.status(400).json({
        success: false,
        message: "Please setup your MPIN first",
      });
    }

    const isMpinCorrect = await bcrypt.compare(
      mpin.toString(),
      user.mpin
    );

    if (!isMpinCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect MPIN",
      });
    }

    // CHECK USER BALANCE
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // FIND BANK BY NAME
    const bankAccount = await Bank.findOne({
      user: user._id,
      bank: bank,
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // UPDATE USER WALLET BALANCE
    user.balance -= Number(amount);
    await user.save();

    // UPDATE BANK BALANCE
    bankAccount.balance += Number(amount);
    await bankAccount.save();

    // SAVE TRANSACTION
    const transaction = await Transaction.create({
      sender: user._id,
      type: "Self_Transfer",
      name: bank,
      amount,
      remark,
    });

    return res.status(200).json({
      success: true,
      message: "Self transfer successful",
      transaction,
      walletBalance: user.balance,
      bankBalance: bankAccount.balance,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Self transfer failed",
    });
  }
};

// TRANSACTION HISTORY
const transactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ sender: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      transactions,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch transactions",
    });
  }
};

module.exports = { sendMoney, getTransactionHistory, bankTransfer, upiTransfer, selfTransfer, transactionHistory };

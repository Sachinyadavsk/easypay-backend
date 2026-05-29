const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

// @desc    Add mock money to wallet from linked bank
// @route   POST /api/wallet/add-money
// @access  Private
const addMoney = async (req, res) => {

  try {
    const { amount } = req.body;
    const userId = req.user._id;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount should be valid' });
    }
    const user = await User.findById(userId);
    user.balance += amount;
    await user.save();
    // Log addition transaction
    const transaction = await Transaction.create({
      sender: userId,
      type: 'ADD_MONEY',
      amount,
      status: 'SUCCESS',
    });
    res.json({ message: `Successfully added ${amount} to wallet`, balance: user.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay Utility Bills (Recharge, Electricity)
// @route   POST /api/wallet/pay-bill
// @access  Private
const payBill = async (req, res) => {
  try {
    const { billerName, consumerNumber, board, mobile_no, amount, mpin } = req.body;
    const userId = req.user._id;
    if (!mpin) {
      return res.status(400).json({
        message: 'MPIN is required'
      });
    }
    const user = await User.findById(userId);
    // Verify MPIN
    if (!user.mpin) return res.status(400).json({
      message: 'Please setup MPIN first'
    });
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect)
      return res.status(401).json({
        message: 'Incorrect MPIN'
      });
    if (user.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    const transaction = await Transaction.create({
      sender: userId,
      type: 'BILL_PAY',
      billerName: billerName || 'Unknown Utility',
      consumerNumber: consumerNumber,
      board: board,
      mobile_no: mobile_no,
      amount,
      status: 'SUCCESS',
    });
    res.json({
      message: `Bill paid successfully for ${billerName}`,
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const mobileRecService = async (req, res) => {
  try {
    const { billerName, operator, plans, mobile_no, amount, mpin } = req.body;
    const userId = req.user._id;
    if (!mpin) {
      return res.status(400).json({
        message: 'MPIN is required'
      });
    }
    const user = await User.findById(userId);
    // Verify MPIN
    if (!user.mpin) return res.status(400).json({
      message: 'Please setup MPIN first'
    });
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect)
      return res.status(401).json({
        message: 'Incorrect MPIN'
      });
    if (user.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    const transaction = await Transaction.create({
      sender: userId,
      type: 'Mobile_Recharge',
      billerName: billerName || 'Unknown Utility',
      operator: operator,
      plans: plans,
      mobile_no: mobile_no,
      amount,
      status: 'SUCCESS',
    });
    res.json({
      message: `Bill paid successfully for ${billerName}`,
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


const dthRecharge = async (req, res) => {
  try {
    const { billerName, operator, consumerNumber, mobile_no, amount, mpin } = req.body;
    const userId = req.user._id;
    if (!mpin) {
      return res.status(400).json({
        message: 'MPIN is required'
      });
    }
    const user = await User.findById(userId);
    // Verify MPIN
    if (!user.mpin) return res.status(400).json({
      message: 'Please setup MPIN first'
    });
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect)
      return res.status(401).json({
        message: 'Incorrect MPIN'
      });
    if (user.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    const transaction = await Transaction.create({
      sender: userId,
      type: 'DTH_RECHARGE',
      billerName: billerName || 'Unknown Utility',
      consumerNumber: consumerNumber,
      operator: operator,
      mobile_no: mobile_no,
      amount,
      status: 'SUCCESS',
    });
    res.json({
      message: `paid successfully for ${billerName}`,
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const waterBill = async (req, res) => {
  try {
    const { billerName, operator, consumerNumber, mobile_no, amount, mpin } = req.body;
    const userId = req.user._id;
    if (!mpin) {
      return res.status(400).json({
        message: 'MPIN is required'
      });
    }
    const user = await User.findById(userId);
    // Verify MPIN
    if (!user.mpin) return res.status(400).json({
      message: 'Please setup MPIN first'
    });
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect)
      return res.status(401).json({
        message: 'Incorrect MPIN'
      });
    if (user.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    const transaction = await Transaction.create({
      sender: userId,
      type: 'Water_Bill',
      billerName: billerName || 'Unknown Utility',
      consumerNumber: consumerNumber,
      operator: operator,
      mobile_no: mobile_no,
      amount,
      status: 'SUCCESS',
    });
    res.json({
      message: `paid successfully for ${billerName}`,
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const insurancePayment = async (req, res) => {
  try {
    const { provider, policyNumber, name, mobile_no, amount, mpin } = req.body;
    const userId = req.user._id;
    if (!mpin) {
      return res.status(400).json({
        message: 'MPIN is required'
      });
    }
    const user = await User.findById(userId);
    // Verify MPIN
    if (!user.mpin) return res.status(400).json({
      message: 'Please setup MPIN first'
    });
    const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMpinCorrect)
      return res.status(401).json({
        message: 'Incorrect MPIN'
      });
    if (user.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct Balance
    user.balance -= amount;
    await user.save();
    const transaction = await Transaction.create({
      sender: userId,
      type: 'Insurance',
      name: name || 'Unknown Utility',
      consumerNumber: policyNumber,
      operator: provider,
      mobile_no: mobile_no,
      amount,
      status: 'SUCCESS',
    });
    res.json({
      message: `paid successfully for ${name}`,
      balance: user.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



const userMpin = async (req, res) => {
  try {
    const { mpin } = req.body

    // VALIDATION
    if (!mpin) {
      return res.status(400).json({
        success: false,
        message: 'MPIN is required'
      })
    }

    if (mpin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'MPIN must be 4 digits'
      })
    }

    // GET USER
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // CHECK WALLET MPIN
    const isMatch = await bcrypt.compare(
      mpin,
      user.mpin
    )

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Wallet MPIN'
      })
    }

    // SUCCESS
    return res.status(200).json({
      success: true,
      message: 'Wallet verified successfully',
      balance: user.balance
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    })
  }
}

const verifyUpi = async (req, res) => {
  try {
    const { upiId } = req.body
    // VALIDATION
    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      })
    }

    // | CHECK USER BY UPI ID

    const user = await User.findOne({
      upiId: upiId.trim()
    }).select('name upiId')

    // USER NOT FOUND
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'UPI ID not found'
      })
    }

    // SUCCESS
    return res.status(200).json({
      success: true,
      message: 'UPI verified successfully',
      data: {
        upiId: user.upiId,
        name: user.name
      }
    })
  } catch (err) {
    console.log(err)

    return res.status(500).json({
      success: false,
      message: 'Server Error'
    })
  }
}

// | SCAN ANY QR TRANSFER
const scanAnyQrTransfer = async (req, res) => {
  try {
    const {
      upiId,
      receiverName,
      amount,
      remark
    } = req.body

    // VALIDATION
    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      })
    }

    if (!receiverName) {
      return res.status(400).json({
        success: false,
        message: 'Receiver name required'
      })
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount required'
      })
    }

    // GET USER
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // CHECK BALANCE
    if (user.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      })
    }

    // BALANCE CALCULATION
    const beforeBalance = Number(user.balance)
    const afterBalance = beforeBalance - Number(amount)

    // UPDATE USER BALANCE
    user.balance = afterBalance
    await user.save()

    // CREATE TRANSACTION
    await Transaction.create({
      type: 'debit',
      sender: user._id,
      name: upiId,
      billerName: receiverName,
      amount,
      remark,
    })

    // SUCCESS
    return res.status(200).json({
      success: true,
      message: 'Money transferred successfully',
      walletBalance: afterBalance
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    })
  }
}


module.exports = {
  addMoney, payBill, userMpin, verifyUpi, scanAnyQrTransfer,
  mobileRecService, dthRecharge, waterBill, insurancePayment
};

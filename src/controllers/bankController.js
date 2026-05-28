const Bank = require('../models/Bank');
const bcrypt = require('bcryptjs');
// ADD BANK
const addBank = async (req, res) => {
    try {
        const { bank, holder, account, ifsc } = req.body;
        if (!bank || !holder || !account || !ifsc) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newBank = await Bank.create({
            user: req.user._id,
            bank,
            holder,
            account: `XXXX${account.slice(-4)}`,
            ifsc,
        });

        res.status(201).json({
            success: true,
            message: "Bank added successfully",
            bank: newBank,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to add bank",
        });
    }
};

// GET MY BANKS
const getMyBanks = async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.user._id, }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            banks,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch banks",
        });
    }
};

const createBanksMpin = async (req, res) => {
    try {
        const { mpin, bankId } = req.body;

        // VALIDATION
        if (!mpin || mpin.length < 4) {
            return res.status(400).json({ message: 'Please provide a valid MPIN (at least 4 digits)' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedMpin = await bcrypt.hash(mpin.toString(), salt);

        // FIND USER BANK
        const bank = await Bank.findOne({
            _id: bankId,
            user: req.user._id,
        });

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank not found',
            });
        }

        // SAVE MPIN
        bank.mpin = hashedMpin;

        await bank.save();

        res.status(200).json({
            success: true,
            message: 'Bank MPIN setup successfully!',
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const verifyBankMpin = async (req, res) => {
    try {
        const { bankId, mpin } = req.body
        const bank = await Bank.findById(bankId)
        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank not found'
            })
        }

        const isMatch = await bcrypt.compare(mpin, bank.mpin)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid MPIN'
            })
        }

        return res.json({
            success: true
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

module.exports = { getMyBanks, addBank, createBanksMpin, verifyBankMpin };
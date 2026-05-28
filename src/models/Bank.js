const mongoose = require('mongoose');
const bankSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        bank: {
            type: String,
            required: true,
            trim: true,
        },

        holder: {
            type: String,
            required: true,
            trim: true,
        },

        account: {
            type: String,
            required: true,
            trim: true,
        },

        ifsc: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        // New Feature: MPIN for transactions
        mpin: {
            type: String, // Stored as a hash
        },
        balance: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Bank = mongoose.model("Bank", bankSchema);
module.exports = Bank;

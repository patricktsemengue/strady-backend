const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our auth middleware
const Transaction = require('../models/Transaction');

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user.id // Assign transaction to the logged-in user
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add PUT and DELETE routes here as well, always using the `auth` middleware
// and checking that `userId` matches `req.user.id`.

module.exports = router;
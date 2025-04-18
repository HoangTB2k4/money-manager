// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionModel = require('../models/transactionModel');

// Lấy danh sách giao dịch theo user và tháng (ví dụ query params: userId, month, year)
router.get('/', async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        const transactions = await transactionModel.getTransactions(userId, month, year);
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu giao dịch' });
    }
});

// Thêm giao dịch mới
router.post('/', async (req, res) => {
    try {
        const newTransaction = req.body;
        const result = await transactionModel.addTransaction(newTransaction);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi thêm giao dịch' });
    }
});

// Cập nhật giao dịch
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTransaction = req.body;
        const result = await transactionModel.updateTransaction(id, updatedTransaction);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật giao dịch' });
    }
});

// Xoá giao dịch
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await transactionModel.deleteTransaction(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi xoá giao dịch' });
    }
});

module.exports = router;

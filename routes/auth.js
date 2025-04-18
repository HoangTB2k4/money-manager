// routes/auth.js
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// Đăng ký người dùng
router.post('/register', async (req, res) => {
    try {
        const userData = req.body; // gồm: fullName, email, password
        const result = await userModel.register(userData);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi đăng ký' });
    }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.login(email, password);
        if (user) {
            res.json({ message: 'Đăng nhập thành công', user });
        } else {
            res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi đăng nhập' });
    }
});

module.exports = router;

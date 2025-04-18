// index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware xử lý body dạng JSON
app.use(express.json());
// Dùng để phục vụ các file tĩnh từ folder public
app.use(express.static(path.join(__dirname, 'public')));

//RSS feed
app.use('/api/news', require('./routes/news'));

// Import các router
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');

// Đặt router
app.use('/api/transactions', transactionsRouter);
app.use('/api/auth', authRouter);

// Route mặc định (có thể trả về file index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

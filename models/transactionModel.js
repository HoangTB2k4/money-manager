// models/transactionModel.js
const sql = require('mssql');
const sqlConfig = require('../config/dbConfig');

// Hàm lấy danh sách giao dịch theo user và tháng/năm
async function getTransactions(userId, month, year) {
    try {
        // Kết nối SQL Server
        let pool = await sql.connect(sqlConfig);
        const query = `
            SELECT * FROM Transactions
            WHERE userId = @userId
              AND MONTH(date) = @month
              AND YEAR(date) = @year
            ORDER BY date DESC
        `;
        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .input('month', sql.Int, parseInt(month))
            .input('year', sql.Int, parseInt(year))
            .query(query);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// Hàm thêm giao dịch mới
async function addTransaction(transaction) {
    try {
        let pool = await sql.connect(sqlConfig);
        const query = `
            INSERT INTO Transactions (userId, type, amount, category, date, note)
            VALUES (@userId, @type, @amount, @category, @date, @note);
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const result = await pool.request()
            .input('userId', sql.Int, transaction.userId)
            .input('type', sql.NVarChar, transaction.type)
            .input('amount', sql.Decimal(18, 2), transaction.amount)
            .input('category', sql.NVarChar, transaction.category)
            .input('date', sql.Date, transaction.date)
            .input('note', sql.NVarChar, transaction.note)
            .query(query);
        return { id: result.recordset[0].id };
    } catch (err) {
        throw err;
    }
}

// Hàm cập nhật giao dịch
async function updateTransaction(id, transaction) {
    try {
        let pool = await sql.connect(sqlConfig);
        const query = `
            UPDATE Transactions 
            SET type = @type, amount = @amount, category = @category, date = @date, note = @note
            WHERE id = @id;
        `;
        await pool.request()
            .input('id', sql.Int, id)
            .input('type', sql.NVarChar, transaction.type)
            .input('amount', sql.Decimal(18, 2), transaction.amount)
            .input('category', sql.NVarChar, transaction.category)
            .input('date', sql.Date, transaction.date)
            .input('note', sql.NVarChar, transaction.note)
            .query(query);
        return { message: 'Cập nhật thành công' };
    } catch (err) {
        throw err;
    }
}

// Hàm xoá giao dịch
async function deleteTransaction(id) {
    try {
        let pool = await sql.connect(sqlConfig);
        const query = `DELETE FROM Transactions WHERE id = @id;`;
        await pool.request().input('id', sql.Int, id).query(query);
        return { message: 'Xoá thành công' };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
};

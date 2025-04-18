// models/userModel.js
const sql = require('mssql');
const sqlConfig = require('../config/dbConfig');
const bcrypt = require('bcrypt'); // Cần cài đặt: npm install bcrypt

// Đăng ký người dùng mới
async function register({ fullName, email, password }) {
    try {
        let pool = await sql.connect(sqlConfig);
        // Băm mật khẩu trước khi lưu
        const passwordHash = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO Users (fullName, email, passwordHash)
            VALUES (@fullName, @email, @passwordHash);
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('passwordHash', sql.NVarChar, passwordHash)
            .query(query);
        return { id: result.recordset[0].id, fullName, email };
    } catch (err) {
        throw err;
    }
}

// Đăng nhập người dùng
async function login(email, password) {
    try {
        let pool = await sql.connect(sqlConfig);
        const query = `SELECT * FROM Users WHERE email = @email`;
        const result = await pool.request().input('email', sql.NVarChar, email).query(query);
        const user = result.recordset[0];
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            // Xóa passwordHash trước khi gửi về
            delete user.passwordHash;
            return user;
        } else {
            return null;
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    register,
    login
};

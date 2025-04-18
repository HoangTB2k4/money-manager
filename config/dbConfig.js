// config/dbConfig.js
module.exports = {
  user: 'sa',                        // Tài khoản đăng nhập SQL Server
  password: '01022004',              // Mật khẩu đăng nhập
  server: 'localhost',               // Hoặc '127.0.0.1'
  database: 'MoneyManagerDB',        // Tên cơ sở dữ liệu
  port: 1433,                        // Cổng mặc định của SQL Server
  options: {
    encrypt: false,                  // Chạy local thì để false
    trustServerCertificate: true     // Bắt buộc khi encrypt = false
  }
};

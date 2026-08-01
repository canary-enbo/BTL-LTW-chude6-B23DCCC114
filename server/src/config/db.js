// Cấu hình kết nối MongoDB bằng Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Kết nối đến MongoDB Atlas bằng URI từ biến môi trường
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    // In lỗi và thoát nếu không kết nối được
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

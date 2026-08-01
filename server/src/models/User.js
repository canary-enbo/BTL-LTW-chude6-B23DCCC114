// Model Người dùng — lưu thông tin tài khoản đăng nhập
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Tên đăng nhập — bắt buộc, duy nhất
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên đăng nhập'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
    },
    // Mật khẩu — bắt buộc, được mã hóa trước khi lưu
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false, // Không trả về mật khẩu khi query
    },
  },
  { timestamps: true }
);

// Middleware: mã hóa mật khẩu trước khi lưu vào database
userSchema.pre('save', async function (next) {
  // Chỉ mã hóa khi mật khẩu được thay đổi
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh mật khẩu nhập vào với mật khẩu đã mã hóa
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// Route xác thực — đăng ký, đăng nhập, lấy thông tin người dùng
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const protect = require('../middleware/auth');

const router = express.Router();

// Hàm tạo JWT token từ id người dùng
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/auth/register — Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra đầu vào
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }

    // Tạo người dùng mới (mật khẩu sẽ được mã hóa bởi middleware pre-save)
    const user = await User.create({ username, password });

    // Tạo 4 danh mục mặc định cho người dùng mới
    const defaultCategories = ['Ăn uống', 'Mua sắm', 'Giải trí', 'Khác'];
    await Category.insertMany(
      defaultCategories.map((name) => ({ name, user: user._id }))
    );

    // Trả về token
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// POST /api/auth/login — Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra đầu vào
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    // Tìm người dùng và lấy cả mật khẩu (mặc định bị ẩn)
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // So sánh mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Trả về token
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
});

// GET /api/auth/me — Lấy thông tin người dùng hiện tại (cần đăng nhập)
router.get('/me', protect, async (req, res) => {
  res.json({
    user: { id: req.user._id, username: req.user.username },
  });
});

module.exports = router;

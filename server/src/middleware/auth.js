// Middleware xác thực JWT — bảo vệ các route cần đăng nhập
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Lấy token từ header Authorization (dạng "Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Nếu không có token thì từ chối truy cập
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
  }

  try {
    // Giải mã token để lấy thông tin người dùng
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Gắn thông tin người dùng vào request (không lấy mật khẩu)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = protect;

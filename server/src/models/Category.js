// Model Danh mục chi tiêu — mỗi danh mục thuộc về một người dùng
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // Tên danh mục — bắt buộc
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      trim: true,
    },
    // Người dùng sở hữu danh mục này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi người dùng không có danh mục trùng tên
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);

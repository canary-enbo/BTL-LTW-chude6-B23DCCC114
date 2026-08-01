// Model Ngân sách — hạn mức chi tiêu theo tháng/năm
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    // Tháng (1-12)
    month: {
      type: Number,
      required: [true, 'Vui lòng chọn tháng'],
      min: 1,
      max: 12,
    },
    // Năm
    year: {
      type: Number,
      required: [true, 'Vui lòng chọn năm'],
    },
    // Hạn mức chi tiêu (VND)
    amount: {
      type: Number,
      required: [true, 'Vui lòng nhập hạn mức'],
      min: [0, 'Hạn mức không được âm'],
    },
    // Người dùng sở hữu ngân sách này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi người dùng chỉ có 1 ngân sách cho mỗi tháng/năm
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

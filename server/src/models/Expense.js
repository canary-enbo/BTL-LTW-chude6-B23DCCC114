// Model Chi tiêu — ghi nhận từng khoản chi của người dùng
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    // Danh mục chi tiêu — tham chiếu đến model Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục'],
    },
    // Số tiền chi tiêu (VND)
    amount: {
      type: Number,
      required: [true, 'Vui lòng nhập số tiền'],
      min: [0, 'Số tiền không được âm'],
    },
    // Ngày chi tiêu
    date: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày'],
      default: Date.now,
    },
    // Ghi chú thêm (tùy chọn)
    note: {
      type: String,
      trim: true,
      default: '',
    },
    // Người dùng sở hữu khoản chi này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn lọc theo người dùng và ngày
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

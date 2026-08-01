// Route quản lý chi tiêu — CRUD + lọc theo tháng/danh mục
const express = require('express');
const Expense = require('../models/Expense');
const protect = require('../middleware/auth');

const router = express.Router();

// Tất cả route đều cần đăng nhập
router.use(protect);

// GET /api/expenses — Lấy danh sách chi tiêu (có thể lọc theo tháng, năm, danh mục)
router.get('/', async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = { user: req.user._id };

    // Lọc theo tháng/năm nếu có
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    // Lọc theo danh mục nếu có
    if (category) {
      filter.category = category;
    }

    // Lấy danh sách chi tiêu, sắp xếp theo ngày mới nhất, kèm tên danh mục
    const expenses = await Expense.find(filter)
      .populate('category', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Lỗi lấy chi tiêu:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiêu' });
  }
});

// POST /api/expenses — Tạo khoản chi tiêu mới
router.post('/', async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;

    // Kiểm tra đầu vào bắt buộc
    if (!category || !amount || !date) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập đầy đủ danh mục, số tiền và ngày' });
    }

    const expense = await Expense.create({
      category,
      amount: Number(amount),
      date: new Date(date),
      note: note || '',
      user: req.user._id,
    });

    // Trả về chi tiêu kèm tên danh mục
    const populated = await expense.populate('category', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Lỗi tạo chi tiêu:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo chi tiêu' });
  }
});

// PUT /api/expenses/:id — Cập nhật khoản chi tiêu
router.put('/:id', async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;

    // Tìm chi tiêu thuộc về người dùng hiện tại
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Không tìm thấy khoản chi tiêu' });
    }

    // Cập nhật các trường nếu có giá trị mới
    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date) expense.date = new Date(date);
    if (note !== undefined) expense.note = note;

    await expense.save();

    const populated = await expense.populate('category', 'name');
    res.json(populated);
  } catch (error) {
    console.error('Lỗi cập nhật chi tiêu:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật chi tiêu' });
  }
});

// DELETE /api/expenses/:id — Xóa khoản chi tiêu
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Không tìm thấy khoản chi tiêu' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa khoản chi tiêu thành công' });
  } catch (error) {
    console.error('Lỗi xóa chi tiêu:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa chi tiêu' });
  }
});

module.exports = router;

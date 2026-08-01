// Route quản lý ngân sách — thiết lập và cập nhật hạn mức chi tiêu theo tháng
const express = require('express');
const Budget = require('../models/Budget');
const protect = require('../middleware/auth');

const router = express.Router();

// Tất cả route đều cần đăng nhập
router.use(protect);

// GET /api/budgets — Lấy danh sách ngân sách (có thể lọc theo năm)
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };

    // Lọc theo năm nếu có
    if (req.query.year) {
      filter.year = Number(req.query.year);
    }

    const budgets = await Budget.find(filter).sort({ year: -1, month: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Lỗi lấy ngân sách:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy ngân sách' });
  }
});

// GET /api/budgets/:month/:year — Lấy ngân sách của một tháng cụ thể
router.get('/:month/:year', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      user: req.user._id,
      month: Number(req.params.month),
      year: Number(req.params.year),
    });

    // Trả về null nếu chưa thiết lập ngân sách cho tháng này
    res.json(budget || null);
  } catch (error) {
    console.error('Lỗi lấy ngân sách tháng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy ngân sách tháng' });
  }
});

// POST /api/budgets — Tạo hoặc cập nhật ngân sách cho tháng/năm (upsert)
router.post('/', async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    // Kiểm tra đầu vào
    if (!month || !year || amount === undefined) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập đầy đủ tháng, năm và hạn mức' });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({ message: 'Hạn mức không được âm' });
    }

    // Upsert: tạo mới nếu chưa có, cập nhật nếu đã có
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        month: Number(month),
        year: Number(year),
      },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    console.error('Lỗi lưu ngân sách:', error);
    res.status(500).json({ message: 'Lỗi server khi lưu ngân sách' });
  }
});

module.exports = router;

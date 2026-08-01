// Route báo cáo và thống kê — tổng hợp chi tiêu theo tháng và năm
const express = require('express');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const protect = require('../middleware/auth');

const router = express.Router();

// Tất cả route đều cần đăng nhập
router.use(protect);

// GET /api/reports/monthly?month=X&year=Y — Báo cáo chi tiêu tháng
router.get('/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Vui lòng chọn tháng và năm' });
    }

    const m = Number(month);
    const y = Number(year);

    // Khoảng thời gian của tháng được chọn
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    // Tổng hợp chi tiêu theo danh mục bằng aggregation pipeline
    const breakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        // Lấy tên danh mục từ collection categories
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$categoryInfo.name',
          total: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Tổng chi tiêu trong tháng
    const totalSpent = breakdown.reduce((sum, item) => sum + item.total, 0);

    // Lấy ngân sách tháng (nếu có)
    const budget = await Budget.findOne({
      user: req.user._id,
      month: m,
      year: y,
    });

    res.json({
      month: m,
      year: y,
      totalSpent,
      budget: budget ? budget.amount : null,
      overBudget:
        budget && totalSpent > budget.amount
          ? totalSpent - budget.amount
          : 0,
      breakdown,
    });
  } catch (error) {
    console.error('Lỗi báo cáo tháng:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo báo cáo tháng' });
  }
});

// GET /api/reports/yearly?year=Y — Thống kê cả năm (12 tháng)
router.get('/yearly', async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'Vui lòng chọn năm' });
    }

    const y = Number(year);

    // Tổng hợp chi tiêu theo từng tháng
    const startDate = new Date(y, 0, 1);
    const endDate = new Date(y + 1, 0, 1);

    const monthlySpending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Lấy tất cả ngân sách của năm
    const budgets = await Budget.find({ user: req.user._id, year: y });

    // Tạo mảng 12 tháng với dữ liệu đầy đủ
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const spending = monthlySpending.find((s) => s._id === m);
      const budget = budgets.find((b) => b.month === m);

      const spent = spending ? spending.total : 0;
      const budgetAmount = budget ? budget.amount : null;

      months.push({
        month: m,
        spent,
        budget: budgetAmount,
        overBudget:
          budgetAmount !== null && spent > budgetAmount
            ? spent - budgetAmount
            : 0,
        count: spending ? spending.count : 0,
      });
    }

    res.json({ year: y, months });
  } catch (error) {
    console.error('Lỗi thống kê năm:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo thống kê năm' });
  }
});

module.exports = router;

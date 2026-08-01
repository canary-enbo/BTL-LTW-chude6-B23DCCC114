// Route quản lý danh mục chi tiêu — CRUD đầy đủ
const express = require('express');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const protect = require('../middleware/auth');

const router = express.Router();

// Tất cả route đều cần đăng nhập
router.use(protect);

// GET /api/categories — Lấy danh sách danh mục của người dùng
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({
      createdAt: 1,
    });
    res.json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
  }
});

// POST /api/categories — Tạo danh mục mới
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập tên danh mục' });
    }

    // Kiểm tra trùng tên danh mục
    const existing = await Category.findOne({
      user: req.user._id,
      name: name.trim(),
    });
    if (existing) {
      return res.status(400).json({ message: 'Danh mục này đã tồn tại' });
    }

    const category = await Category.create({
      name: name.trim(),
      user: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Lỗi tạo danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo danh mục' });
  }
});

// PUT /api/categories/:id — Cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập tên danh mục' });
    }

    // Tìm danh mục thuộc về người dùng hiện tại
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Kiểm tra trùng tên (trừ chính nó)
    const duplicate = await Category.findOne({
      user: req.user._id,
      name: name.trim(),
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Danh mục này đã tồn tại' });
    }

    category.name = name.trim();
    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Lỗi cập nhật danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật danh mục' });
  }
});

// DELETE /api/categories/:id — Xóa danh mục
router.delete('/:id', async (req, res) => {
  try {
    // Tìm danh mục thuộc về người dùng hiện tại
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Kiểm tra xem có chi tiêu nào đang dùng danh mục này không
    const expenseCount = await Expense.countDocuments({
      category: req.params.id,
    });
    if (expenseCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì có ${expenseCount} khoản chi tiêu đang sử dụng`,
      });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi xóa danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục' });
  }
});

module.exports = router;

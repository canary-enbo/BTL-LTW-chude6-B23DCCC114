// Trang quản lý chi tiêu — thêm, sửa, xóa, lọc theo tháng/danh mục
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  clearExpenseError,
} from '../store/slices/expenseSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { formatCurrency, formatDate, toInputDate, MONTH_NAMES } from '../utils/helpers';
import { Expense } from '../types';

const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { expenses, loading, error } = useAppSelector((state) => state.expenses);
  const { categories } = useAppSelector((state) => state.categories);

  const now = new Date();

  // Bộ lọc — mặc định là tháng/năm hiện tại
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [filterCategory, setFilterCategory] = useState('');

  // State quản lý modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(now.toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Tải danh mục khi vào trang
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Tải chi tiêu theo bộ lọc
  useEffect(() => {
    const params: { month?: number; year?: number; category?: string } = {};
    if (filterMonth) params.month = Number(filterMonth);
    if (filterYear) params.year = Number(filterYear);
    if (filterCategory) params.category = filterCategory;
    dispatch(fetchExpenses(params));
  }, [dispatch, filterMonth, filterYear, filterCategory]);

  // Mở modal thêm chi tiêu mới
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormCategory(categories.length > 0 ? categories[0]._id : '');
    setFormAmount('');
    setFormDate(now.toISOString().split('T')[0]);
    setFormNote('');
    setIsModalOpen(true);
  };

  // Mở modal sửa chi tiêu
  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormCategory(
      typeof expense.category === 'object' ? expense.category._id : expense.category
    );
    setFormAmount(String(expense.amount));
    setFormDate(toInputDate(expense.date));
    setFormNote(expense.note || '');
    setIsModalOpen(true);
  };

  // Xử lý lưu (thêm hoặc sửa)
  const handleSave = async () => {
    if (!formCategory || !formAmount || !formDate) return;

    try {
      if (editingExpense) {
        await dispatch(
          updateExpense({
            id: editingExpense._id,
            data: {
              category: formCategory,
              amount: Number(formAmount),
              date: formDate,
              note: formNote,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createExpense({
            category: formCategory,
            amount: Number(formAmount),
            date: formDate,
            note: formNote,
          })
        ).unwrap();
      }
      setIsModalOpen(false);
      // Tải lại danh sách sau khi thêm/sửa
      const params: { month?: number; year?: number; category?: string } = {};
      if (filterMonth) params.month = Number(filterMonth);
      if (filterYear) params.year = Number(filterYear);
      if (filterCategory) params.category = filterCategory;
      dispatch(fetchExpenses(params));
    } catch {
      // Lỗi sẽ hiển thị qua error state
    }
  };

  // Xử lý xóa chi tiêu
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteExpense(id)).unwrap();
      setDeleteConfirm(null);
    } catch {
      // Lỗi sẽ hiển thị qua error state
    }
  };

  // Tổng chi tiêu hiện tại
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Tùy chọn cho dropdown năm (5 năm gần đây)
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: String(y), label: String(y) };
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề và nút thêm */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiêu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các khoản chi tiêu
          </p>
        </div>
        <Button onClick={handleOpenAdd}>+ Thêm chi tiêu</Button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => dispatch(clearExpenseError())}
        />
      )}

      {/* Bộ lọc */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Tháng"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            options={[
              { value: '', label: 'Tất cả' },
              ...MONTH_NAMES.map((name, i) => ({
                value: String(i + 1),
                label: name,
              })),
            ]}
          />
          <Select
            label="Năm"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            options={yearOptions}
          />
          <Select
            label="Danh mục"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: '', label: 'Tất cả' },
              ...categories.map((c) => ({ value: c._id, label: c.name })),
            ]}
          />
        </div>
      </Card>

      {/* Tổng chi tiêu */}
      <div className="flex justify-between items-center px-1">
        <span className="text-sm text-gray-600">
          {expenses.length} khoản chi tiêu
        </span>
        <span className="text-sm font-semibold text-gray-900">
          Tổng: {formatCurrency(total)}
        </span>
      </div>

      {/* Danh sách chi tiêu */}
      <Card>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Không có khoản chi tiêu nào
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Ngày
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Ghi chú
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">
                    Số tiền
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {typeof expense.category === 'object'
                          ? expense.category.name
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">
                      {expense.note || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {deleteConfirm === expense._id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(expense._id)}
                          >
                            Xóa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(expense)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(expense._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal thêm/sửa chi tiêu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Sửa chi tiêu' : 'Thêm chi tiêu mới'}
      >
        <div className="space-y-4">
          <Select
            label="Danh mục"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="Chọn danh mục"
          />
          <Input
            label="Số tiền (VND)"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="Ví dụ: 50000"
            min="0"
          />
          <Input
            label="Ngày"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />
          <Input
            label="Ghi chú"
            type="text"
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            placeholder="Ví dụ: Cà phê sáng..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formCategory || !formAmount || !formDate}
            >
              {editingExpense ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;

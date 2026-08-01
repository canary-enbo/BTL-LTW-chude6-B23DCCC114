// Trang quản lý ngân sách — thiết lập hạn mức chi tiêu theo tháng
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBudgets,
  upsertBudget,
  clearBudgetError,
} from '../store/slices/budgetSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { formatCurrency, MONTH_NAMES } from '../utils/helpers';

const BudgetPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { budgets, loading, error } = useAppSelector((state) => state.budgets);

  const now = new Date();

  // State cho form thiết lập ngân sách
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [amount, setAmount] = useState('');
  const [viewYear, setViewYear] = useState(String(now.getFullYear()));
  const [successMsg, setSuccessMsg] = useState('');

  // Tải danh sách ngân sách theo năm đang xem
  useEffect(() => {
    dispatch(fetchBudgets({ year: Number(viewYear) }));
  }, [dispatch, viewYear]);

  // Khi chọn tháng/năm, tự động điền số tiền nếu đã có ngân sách
  useEffect(() => {
    const existing = budgets.find(
      (b) =>
        b.month === Number(selectedMonth) && b.year === Number(selectedYear)
    );
    if (existing) {
      setAmount(String(existing.amount));
    } else {
      setAmount('');
    }
  }, [selectedMonth, selectedYear, budgets]);

  // Xử lý lưu ngân sách
  const handleSave = async () => {
    if (!amount || Number(amount) < 0) return;

    try {
      await dispatch(
        upsertBudget({
          month: Number(selectedMonth),
          year: Number(selectedYear),
          amount: Number(amount),
        })
      ).unwrap();
      setSuccessMsg('Đã lưu ngân sách thành công!');
      // Tải lại danh sách ngân sách
      dispatch(fetchBudgets({ year: Number(viewYear) }));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      // Lỗi sẽ hiển thị qua error state
    }
  };

  // Tùy chọn cho dropdown năm
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: String(y), label: String(y) };
  });

  // Ngân sách của năm đang xem, sắp xếp theo tháng
  const yearBudgets = budgets
    .filter((b) => b.year === Number(viewYear))
    .sort((a, b) => a.month - b.month);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ngân sách</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thiết lập hạn mức chi tiêu hàng tháng
        </p>
      </div>

      {/* Thông báo */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => dispatch(clearBudgetError())}
        />
      )}
      {successMsg && <Alert type="success" message={successMsg} />}

      {/* Form thiết lập ngân sách */}
      <Card title="Thiết lập ngân sách">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Tháng"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={MONTH_NAMES.map((name, i) => ({
              value: String(i + 1),
              label: name,
            }))}
          />
          <Select
            label="Năm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
          />
          <Input
            label="Hạn mức (VND)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ví dụ: 5000000"
            min="0"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={!amount || Number(amount) < 0}>
            Lưu ngân sách
          </Button>
        </div>
      </Card>

      {/* Bảng ngân sách theo năm */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Ngân sách năm {viewYear}
          </h3>
          <Select
            value={viewYear}
            onChange={(e) => setViewYear(e.target.value)}
            options={yearOptions}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : yearBudgets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Chưa thiết lập ngân sách cho năm {viewYear}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Tháng
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">
                    Hạn mức
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {yearBudgets.map((budget) => (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">
                      {MONTH_NAMES[budget.month - 1]}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      {formatCurrency(budget.amount)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMonth(String(budget.month));
                          setSelectedYear(String(budget.year));
                          setAmount(String(budget.amount));
                          // Cuộn lên form
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BudgetPage;

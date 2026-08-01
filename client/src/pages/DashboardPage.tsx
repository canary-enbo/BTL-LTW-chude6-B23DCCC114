// Trang tổng quan — hiển thị tóm tắt chi tiêu tháng hiện tại
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/slices/expenseSlice';
import { fetchMonthlyReport } from '../store/slices/reportSlice';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Expense } from '../types';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { expenses } = useAppSelector((state) => state.expenses);
  const { monthlyReport } = useAppSelector((state) => state.reports);

  // Lấy tháng và năm hiện tại
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Tải dữ liệu chi tiêu và báo cáo tháng hiện tại
  useEffect(() => {
    dispatch(fetchExpenses({ month: currentMonth, year: currentYear }));
    dispatch(fetchMonthlyReport({ month: currentMonth, year: currentYear }));
  }, [dispatch, currentMonth, currentYear]);

  // Tính toán các số liệu tổng quan
  const totalSpent = monthlyReport?.totalSpent || 0;
  const budget = monthlyReport?.budget;
  const overBudget = monthlyReport?.overBudget || 0;
  const remaining = budget ? budget - totalSpent : null;

  // 5 chi tiêu gần nhất
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tháng {currentMonth}/{currentYear}
        </p>
      </div>

      {/* Cảnh báo vượt ngân sách */}
      {overBudget > 0 && (
        <Alert
          type="error"
          message={`⚠️ Bạn đã chi vượt ngân sách ${formatCurrency(overBudget)}! Tổng chi: ${formatCurrency(totalSpent)} / Ngân sách: ${formatCurrency(budget!)}`}
        />
      )}

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tổng chi tiêu tháng */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng chi tháng này</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </Card>

        {/* Ngân sách */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngân sách tháng</p>
              <p className="text-xl font-bold text-gray-900">
                {budget !== null && budget !== undefined ? formatCurrency(budget) : 'Chưa thiết lập'}
              </p>
            </div>
          </div>
        </Card>

        {/* Còn lại */}
        <Card>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              remaining !== null && remaining < 0
                ? 'bg-red-100'
                : 'bg-amber-100'
            }`}>
              <svg className={`w-6 h-6 ${remaining !== null && remaining < 0 ? 'text-red-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Còn lại</p>
              <p className={`text-xl font-bold ${remaining !== null && remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {remaining !== null ? formatCurrency(remaining) : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Thanh tiến trình ngân sách */}
      {budget !== null && budget !== undefined && budget > 0 && (
        <Card title="Tiến độ chi tiêu">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Đã chi: {formatCurrency(totalSpent)}</span>
              <span className="text-gray-600">Ngân sách: {formatCurrency(budget)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalSpent / budget > 1
                    ? 'bg-red-500'
                    : totalSpent / budget > 0.8
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {((totalSpent / budget) * 100).toFixed(1)}% ngân sách
            </p>
          </div>
        </Card>
      )}

      {/* Chi tiêu gần đây */}
      <Card title="Chi tiêu gần đây">
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Chưa có khoản chi tiêu nào trong tháng này
          </p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense: Expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {typeof expense.category === 'object'
                      ? expense.category.name
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(expense.date)}
                    {expense.note && ` • ${expense.note}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            ))}
            <Link
              to="/expenses"
              className="block text-center text-sm text-indigo-600 font-medium hover:text-indigo-700 pt-2"
            >
              Xem tất cả chi tiêu →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;

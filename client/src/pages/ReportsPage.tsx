// Trang báo cáo — thống kê chi tiêu theo tháng và năm
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMonthlyReport,
  fetchYearlyReport,
} from '../store/slices/reportSlice';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { formatCurrency, MONTH_NAMES, CHART_COLORS } from '../utils/helpers';

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { monthlyReport, yearlyReport, loading } = useAppSelector(
    (state) => state.reports
  );

  const now = new Date();

  // State chọn tháng/năm cho báo cáo
  const [reportMonth, setReportMonth] = useState(String(now.getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(now.getFullYear()));
  const [yearlyReportYear, setYearlyReportYear] = useState(
    String(now.getFullYear())
  );

  // Tải báo cáo tháng khi thay đổi tháng/năm
  useEffect(() => {
    dispatch(
      fetchMonthlyReport({
        month: Number(reportMonth),
        year: Number(reportYear),
      })
    );
  }, [dispatch, reportMonth, reportYear]);

  // Tải thống kê năm khi thay đổi năm
  useEffect(() => {
    dispatch(fetchYearlyReport({ year: Number(yearlyReportYear) }));
  }, [dispatch, yearlyReportYear]);

  // Tùy chọn cho dropdown năm
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: String(y), label: String(y) };
  });

  // Dữ liệu cho biểu đồ tròn
  const pieData =
    monthlyReport?.breakdown.map((item) => ({
      name: item.categoryName,
      value: item.total,
    })) || [];

  // Dữ liệu cho biểu đồ cột năm
  const barData =
    yearlyReport?.months.map((m) => ({
      name: `T${m.month}`,
      'Chi tiêu': m.spent,
      'Ngân sách': m.budget || 0,
    })) || [];

  // Tooltip tùy chỉnh cho biểu đồ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê chi tiêu theo tháng và năm
        </p>
      </div>

      {/* === BÁO CÁO THÁNG === */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Báo cáo tháng
        </h2>

        {/* Bộ lọc tháng/năm */}
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tháng"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              options={MONTH_NAMES.map((name, i) => ({
                value: String(i + 1),
                label: name,
              }))}
            />
            <Select
              label="Năm"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              options={yearOptions}
            />
          </div>
        </Card>

        {/* Cảnh báo vượt ngân sách */}
        {monthlyReport && monthlyReport.overBudget > 0 && (
          <Alert
            type="error"
            message={`⚠️ VƯỢT NGÂN SÁCH! Bạn đã chi vượt ${formatCurrency(monthlyReport.overBudget)}. Tổng chi: ${formatCurrency(monthlyReport.totalSpent)} / Ngân sách: ${formatCurrency(monthlyReport.budget!)}`}
          />
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : monthlyReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tổng quan tháng */}
            <Card title="Tổng quan">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tổng chi tiêu</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(monthlyReport.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Ngân sách</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {monthlyReport.budget !== null
                      ? formatCurrency(monthlyReport.budget)
                      : 'Chưa thiết lập'}
                  </span>
                </div>
                {monthlyReport.budget !== null && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">
                      {monthlyReport.overBudget > 0 ? 'Vượt ngân sách' : 'Còn lại'}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        monthlyReport.overBudget > 0
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {monthlyReport.overBudget > 0
                        ? formatCurrency(monthlyReport.overBudget)
                        : formatCurrency(
                            monthlyReport.budget - monthlyReport.totalSpent
                          )}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Biểu đồ tròn theo danh mục */}
            <Card title="Theo danh mục">
              {pieData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Không có dữ liệu
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Bảng chi tiết theo danh mục */}
            <Card title="Chi tiết theo danh mục" className="lg:col-span-2">
              {monthlyReport.breakdown.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Không có dữ liệu
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">
                          Danh mục
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          Số lượng
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          Tổng tiền
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">
                          Tỉ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthlyReport.breakdown.map((item, index) => (
                        <tr key={item.categoryId} className="hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                              <span className="text-gray-900">
                                {item.categoryName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            {item.count}
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            {monthlyReport.totalSpent > 0
                              ? (
                                  (item.total / monthlyReport.totalSpent) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-semibold">
                        <td className="py-3 px-2 text-gray-900">Tổng cộng</td>
                        <td className="py-3 px-2 text-right text-gray-600">
                          {monthlyReport.breakdown.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-900">
                          {formatCurrency(monthlyReport.totalSpent)}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-600">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </Card>
          </div>
        ) : null}
      </div>

      {/* === THỐNG KÊ NĂM === */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Thống kê năm
          </h2>
          <div className="w-32">
            <Select
              value={yearlyReportYear}
              onChange={(e) => setYearlyReportYear(e.target.value)}
              options={yearOptions}
            />
          </div>
        </div>

        {/* Biểu đồ cột so sánh chi tiêu vs ngân sách */}
        {yearlyReport && (
          <Card title={`Chi tiêu và ngân sách năm ${yearlyReportYear}`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(0)}tr`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}k`
                      : String(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
                <Bar dataKey="Chi tiêu" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ngân sách" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Bảng thống kê 12 tháng */}
        {yearlyReport && (
          <Card title="Chi tiết 12 tháng">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Tháng
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">
                      Chi tiêu
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">
                      Ngân sách
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">
                      Vượt ngân sách
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">
                      Số khoản
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yearlyReport.months.map((m) => (
                    <tr
                      key={m.month}
                      className={`hover:bg-gray-50 ${
                        m.overBudget > 0 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-gray-900">
                        {MONTH_NAMES[m.month - 1]}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">
                        {m.spent > 0 ? formatCurrency(m.spent) : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600">
                        {m.budget !== null
                          ? formatCurrency(m.budget)
                          : '—'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {m.overBudget > 0 ? (
                          <span className="text-red-600 font-semibold">
                            +{formatCurrency(m.overBudget)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600">
                        {m.count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

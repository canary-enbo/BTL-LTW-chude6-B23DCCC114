// Định nghĩa các kiểu dữ liệu TypeScript dùng chung trong ứng dụng

// Thông tin người dùng
export interface User {
  id: string;
  username: string;
}

// Phản hồi từ API đăng nhập/đăng ký
export interface AuthResponse {
  token: string;
  user: User;
}

// Danh mục chi tiêu
export interface Category {
  _id: string;
  name: string;
  user: string;
  createdAt: string;
}

// Khoản chi tiêu
export interface Expense {
  _id: string;
  category: Category | string;
  amount: number;
  date: string;
  note: string;
  user: string;
  createdAt: string;
}

// Dữ liệu tạo/cập nhật chi tiêu
export interface ExpenseInput {
  category: string;
  amount: number;
  date: string;
  note?: string;
}

// Ngân sách theo tháng
export interface Budget {
  _id: string;
  month: number;
  year: number;
  amount: number;
  user: string;
}

// Dữ liệu tạo/cập nhật ngân sách
export interface BudgetInput {
  month: number;
  year: number;
  amount: number;
}

// Chi tiết chi tiêu theo danh mục trong báo cáo tháng
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
}

// Báo cáo chi tiêu tháng
export interface MonthlyReport {
  month: number;
  year: number;
  totalSpent: number;
  budget: number | null;
  overBudget: number;
  breakdown: CategoryBreakdown[];
}

// Dữ liệu từng tháng trong thống kê năm
export interface MonthlyData {
  month: number;
  spent: number;
  budget: number | null;
  overBudget: number;
  count: number;
}

// Thống kê cả năm
export interface YearlyReport {
  year: number;
  months: MonthlyData[];
}

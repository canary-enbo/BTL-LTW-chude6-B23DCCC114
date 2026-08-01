// Slice quản lý chi tiêu — CRUD + lọc theo tháng/danh mục
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { Expense, ExpenseInput } from '../../types';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
};

// Thunk: Lấy danh sách chi tiêu (có thể lọc)
export const fetchExpenses = createAsyncThunk<
  Expense[],
  { month?: number; year?: number; category?: string } | void,
  { rejectValue: string }
>('expenses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    if (params) {
      if (params.month) query.append('month', String(params.month));
      if (params.year) query.append('year', String(params.year));
      if (params.category) query.append('category', params.category);
    }
    const response = await api.get<Expense[]>(`/expenses?${query.toString()}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải chi tiêu'
    );
  }
});

// Thunk: Tạo chi tiêu mới
export const createExpense = createAsyncThunk<
  Expense,
  ExpenseInput,
  { rejectValue: string }
>('expenses/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tạo chi tiêu'
    );
  }
});

// Thunk: Cập nhật chi tiêu
export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; data: Partial<ExpenseInput> },
  { rejectValue: string }
>('expenses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi cập nhật chi tiêu'
    );
  }
});

// Thunk: Xóa chi tiêu
export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('expenses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/expenses/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi xóa chi tiêu'
    );
  }
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Lấy danh sách
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi tải chi tiêu';
      });

    // Tạo mới
    builder
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi tạo chi tiêu';
      });

    // Cập nhật
    builder
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const index = state.expenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.expenses[index] = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi cập nhật chi tiêu';
      });

    // Xóa
    builder
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi xóa chi tiêu';
      });
  },
});

export const { clearExpenseError } = expenseSlice.actions;
export default expenseSlice.reducer;

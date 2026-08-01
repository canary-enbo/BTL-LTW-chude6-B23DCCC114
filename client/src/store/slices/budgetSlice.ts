// Slice quản lý ngân sách theo tháng — tạo và cập nhật hạn mức
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { Budget, BudgetInput } from '../../types';

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  currentBudget: null,
  loading: false,
  error: null,
};

// Thunk: Lấy danh sách ngân sách (có thể lọc theo năm)
export const fetchBudgets = createAsyncThunk<
  Budget[],
  { year?: number } | void,
  { rejectValue: string }
>('budgets/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = params?.year ? `?year=${params.year}` : '';
    const response = await api.get<Budget[]>(`/budgets${query}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải ngân sách'
    );
  }
});

// Thunk: Lấy ngân sách của tháng cụ thể
export const fetchBudgetByMonth = createAsyncThunk<
  Budget | null,
  { month: number; year: number },
  { rejectValue: string }
>('budgets/fetchByMonth', async ({ month, year }, { rejectWithValue }) => {
  try {
    const response = await api.get<Budget | null>(`/budgets/${month}/${year}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải ngân sách tháng'
    );
  }
});

// Thunk: Tạo hoặc cập nhật ngân sách (upsert)
export const upsertBudget = createAsyncThunk<
  Budget,
  BudgetInput,
  { rejectValue: string }
>('budgets/upsert', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<Budget>('/budgets', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi lưu ngân sách'
    );
  }
});

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Lấy danh sách
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi tải ngân sách';
      });

    // Lấy theo tháng
    builder
      .addCase(fetchBudgetByMonth.fulfilled, (state, action: PayloadAction<Budget | null>) => {
        state.currentBudget = action.payload;
      });

    // Upsert
    builder
      .addCase(upsertBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        const index = state.budgets.findIndex(
          (b) => b.month === action.payload.month && b.year === action.payload.year
        );
        if (index !== -1) {
          state.budgets[index] = action.payload;
        } else {
          state.budgets.push(action.payload);
        }
        state.currentBudget = action.payload;
      })
      .addCase(upsertBudget.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi lưu ngân sách';
      });
  },
});

export const { clearBudgetError } = budgetSlice.actions;
export default budgetSlice.reducer;

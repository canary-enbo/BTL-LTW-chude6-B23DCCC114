// Slice quản lý báo cáo và thống kê
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { MonthlyReport, YearlyReport } from '../../types';

interface ReportState {
  monthlyReport: MonthlyReport | null;
  yearlyReport: YearlyReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  monthlyReport: null,
  yearlyReport: null,
  loading: false,
  error: null,
};

// Thunk: Lấy báo cáo tháng
export const fetchMonthlyReport = createAsyncThunk<
  MonthlyReport,
  { month: number; year: number },
  { rejectValue: string }
>('reports/monthly', async ({ month, year }, { rejectWithValue }) => {
  try {
    const response = await api.get<MonthlyReport>(
      `/reports/monthly?month=${month}&year=${year}`
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải báo cáo tháng'
    );
  }
});

// Thunk: Lấy thống kê năm
export const fetchYearlyReport = createAsyncThunk<
  YearlyReport,
  { year: number },
  { rejectValue: string }
>('reports/yearly', async ({ year }, { rejectWithValue }) => {
  try {
    const response = await api.get<YearlyReport>(`/reports/yearly?year=${year}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải thống kê năm'
    );
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Báo cáo tháng
    builder
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action: PayloadAction<MonthlyReport>) => {
        state.loading = false;
        state.monthlyReport = action.payload;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi tải báo cáo tháng';
      });

    // Thống kê năm
    builder
      .addCase(fetchYearlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchYearlyReport.fulfilled, (state, action: PayloadAction<YearlyReport>) => {
        state.loading = false;
        state.yearlyReport = action.payload;
      })
      .addCase(fetchYearlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi tải thống kê năm';
      });
  },
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;

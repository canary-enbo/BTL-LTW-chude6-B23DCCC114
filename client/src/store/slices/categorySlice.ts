// Slice quản lý danh mục chi tiêu — CRUD đầy đủ
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { Category } from '../../types';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Thunk: Lấy danh sách danh mục
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tải danh mục'
    );
  }
});

// Thunk: Tạo danh mục mới
export const createCategory = createAsyncThunk<
  Category,
  { name: string },
  { rejectValue: string }
>('categories/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi tạo danh mục'
    );
  }
});

// Thunk: Cập nhật danh mục
export const updateCategory = createAsyncThunk<
  Category,
  { id: string; name: string },
  { rejectValue: string }
>('categories/update', async ({ id, name }, { rejectWithValue }) => {
  try {
    const response = await api.put<Category>(`/categories/${id}`, { name });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi cập nhật danh mục'
    );
  }
});

// Thunk: Xóa danh mục
export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('categories/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/categories/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Lỗi khi xóa danh mục'
    );
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Lấy danh sách
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi khi tải danh mục';
      });

    // Tạo mới
    builder
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi tạo danh mục';
      });

    // Cập nhật
    builder
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi cập nhật danh mục';
      });

    // Xóa
    builder
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload || 'Lỗi khi xóa danh mục';
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;

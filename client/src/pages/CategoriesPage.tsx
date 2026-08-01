// Trang quản lý danh mục — thêm, sửa, xóa danh mục chi tiêu
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} from '../store/slices/categorySlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.categories);

  // State quản lý modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Tải danh sách danh mục khi vào trang
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Mở modal thêm danh mục mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  // Mở modal sửa danh mục
  const handleOpenEdit = (id: string, name: string) => {
    setEditingId(id);
    setCategoryName(name);
    setIsModalOpen(true);
  };

  // Xử lý lưu (thêm hoặc sửa)
  const handleSave = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, name: categoryName })).unwrap();
      } else {
        await dispatch(createCategory({ name: categoryName })).unwrap();
      }
      setIsModalOpen(false);
      setCategoryName('');
      setEditingId(null);
    } catch {
      // Lỗi sẽ được hiển thị qua error state
    }
  };

  // Xử lý xóa danh mục
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      setDeleteConfirm(null);
    } catch {
      // Lỗi sẽ được hiển thị qua error state
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề và nút thêm */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các danh mục chi tiêu
          </p>
        </div>
        <Button onClick={handleOpenAdd}>+ Thêm danh mục</Button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => dispatch(clearCategoryError())}
        />
      )}

      {/* Danh sách danh mục */}
      <Card>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Chưa có danh mục nào
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút sửa */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(cat._id, cat.name)}
                  >
                    Sửa
                  </Button>

                  {/* Nút xóa hoặc xác nhận xóa */}
                  {deleteConfirm === cat._id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Xác nhận
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(cat._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal thêm/sửa danh mục */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
      >
        <div className="space-y-4">
          <Input
            label="Tên danh mục"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Ví dụ: Ăn uống, Đi lại..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!categoryName.trim()}>
              {editingId ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

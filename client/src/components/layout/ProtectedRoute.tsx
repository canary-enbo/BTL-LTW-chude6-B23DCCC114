// Component bảo vệ route — chuyển hướng đến trang đăng nhập nếu chưa xác thực
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

const ProtectedRoute: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  // Nếu chưa đăng nhập thì chuyển đến trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

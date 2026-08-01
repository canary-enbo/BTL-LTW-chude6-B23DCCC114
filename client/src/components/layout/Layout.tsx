// Component bố cục chính — sidebar + nội dung
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Nội dung chính — đẩy sang phải bằng chiều rộng sidebar trên desktop */}
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:pt-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

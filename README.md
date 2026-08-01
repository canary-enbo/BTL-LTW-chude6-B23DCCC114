# Ứng Dụng Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web quản lý chi tiêu cá nhân được xây dựng bằng React + TypeScript (frontend) và Node.js + Express + MongoDB (backend).

## Yêu Cầu Hệ Thống

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (đã cấu hình sẵn trong file `.env`)

## Cấu Trúc Dự Án

```
├── client/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── api/          # Cấu hình Axios
│   │   ├── components/   # Components tái sử dụng (UI + Layout)
│   │   ├── pages/        # Các trang chính
│   │   ├── store/        # Redux store và slices
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Hàm tiện ích
│   └── ...
├── server/          # Backend Express + MongoDB
│   ├── src/
│   │   ├── config/       # Cấu hình database
│   │   ├── middleware/   # JWT auth middleware
│   │   ├── models/       # Mongoose models
│   │   └── routes/       # API routes
│   └── ...
└── README.md
```

## Cách Chạy Dự Án

### 1. Backend (Server)

```bash
cd server
npm install
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

### 2. Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Client sẽ chạy tại `http://localhost:3000`

> **Lưu ý**: Chạy cả hai server cùng lúc. Frontend đã được cấu hình proxy đến backend.

## Tính Năng

- 🔐 Đăng ký / Đăng nhập (JWT)
- 📂 Quản lý danh mục chi tiêu
- 💰 Quản lý chi tiêu (thêm, sửa, xóa, lọc)
- 📊 Thiết lập ngân sách hàng tháng
- 📈 Báo cáo thống kê (tháng/năm) với biểu đồ

## Công Nghệ Sử Dụng

**Frontend**: React, TypeScript, Redux Toolkit, React Router, Axios, Tailwind CSS, Recharts

**Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs

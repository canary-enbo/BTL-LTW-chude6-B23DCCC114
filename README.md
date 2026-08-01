# Ứng Dụng Quản Lý Chi Tiêu Cá Nhân

# Cách truy cập
* Cách 1: Truy cập trực tiếp link: https://quanlychitieub23dccc114.onrender.com
- tài khoản test: Tên đăng nhập : minh , password: minh123
- Lưu ý: Sau khi nhấn đăng nhập/đăng ký user cần đợi 15s để server chạy mới có thể vào trang chính
* Cách 2: 
- B1: Truy cập link khởi động server: https://quanlychitieu-lw30.onrender.com
- B2: Truy cập link khởi động client:  https://quanlychitieub23dccc114.onrender.com

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

## Tính Năng

- 🔐 Đăng ký / Đăng nhập (JWT)
- 📂 Quản lý danh mục chi tiêu
- 💰 Quản lý chi tiêu (thêm, sửa, xóa, lọc)
- 📊 Thiết lập ngân sách hàng tháng
- 📈 Báo cáo thống kê (tháng/năm) với biểu đồ

## Công Nghệ Sử Dụng

**Frontend**: React, TypeScript, Redux Toolkit, React Router, Axios, Tailwind CSS, Recharts

**Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs

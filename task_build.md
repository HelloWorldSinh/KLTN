# Kế hoạch triển khai (Task List)

## 1. Phase 1: Nền tảng và Quản lý người dùng (Core & Auth)
- [x] Thiết kế và cập nhật Database Schema (ERD).
- [x] Xây dựng các API Đăng ký, Đăng nhập và Quản lý tài khoản (UC01, UC02, UC03).
- [x] Tích hợp JWT, Spring Security và phân quyền (Role-based access control).
- [x] Xây dựng Frontend cho Xác thực và Quản lý thông tin cá nhân.
- [x] Xây dựng chức năng Quản lý tài khoản hệ thống cho Admin (UC16). (90% - Fixed UI issues)

## 2. Phase 2: Quản lý danh mục & Lễ tân (Catalog & Receptionist)
- [x] API và Giao diện Quản lý chuyên khoa (UC18)
- [x] API và Giao diện Quản lý danh mục thuốc (UC21).
- [x] API và Giao diện thiết lập lịch làm việc cho bác sĩ (UC19).

## 3. Phase 3: Đăng ký khám & Quản lý lịch hẹn (Booking)
- [ ] API và Giao diện Tra cứu thông tin bác sĩ, chuyên khoa cho Bệnh nhân (UC08).
- [ ] API và Giao diện Đăng ký lịch khám cho Bệnh nhân (UC04).
- [ ] API và Giao diện Hủy lịch khám, Xem lịch sử khám (UC05, UC06).
- [ ] API và Giao diện cho Lễ tân tiếp nhận, xác nhận lịch khám (UC09, UC10).
- [ ] Module Thông báo (UC07).

## 4. Phase 4: Quy trình khám bệnh (Doctor Process)
- [ ] API và Giao diện Bác sĩ xem lịch khám cá nhân và danh sách bệnh nhân (UC12, UC13).
- [ ] API và Giao diện Ghi nhận chẩn đoán và Kê đơn thuốc (UC14, UC15).
- [ ] Cập nhật Frontend Bệnh nhân xem chi tiết đơn thuốc (UC20).

## 5. Phase 5: Báo cáo & Chatbot (Reporting & AI)
- [ ] API và Giao diện Dashboard / Báo cáo số liệu cho Admin (UC11).
- [ ] Khảo sát công nghệ Chatbot (Dialogflow, Rasa, OpenAI API).
- [ ] Tích hợp Chatbot vào Frontend (Widget).
- [ ] Xây dựng luồng Chatbot: FAQ, hướng dẫn đặt lịch khám, chuyển handoff.

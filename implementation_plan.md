# Kế hoạch triển khai Hệ thống Đăng ký khám bệnh trực tuyến

Tài liệu này trình bày chi tiết kế hoạch thực hiện thiết kế và lập trình các chức năng được mô tả trong [mota.md](file:///d:/hoctap/KLTN/app/mota.md). Hệ thống được chia thành 2 phần chính: Backend (Spring Boot) và Frontend (React/TSX).

## User Review Required

> [!IMPORTANT]
> Vui lòng xem qua kế hoạch triển khai dưới đây. Các phase được sắp xếp theo thứ tự ưu tiên logic (từ cốt lõi đến tính năng nâng cao). Bạn có đồng ý với lộ trình này không, hay muốn ưu tiên phát triển nhóm chức năng nào trước?

## Proposed Changes

Dự án sẽ được triển khai theo 5 Phase chính để đảm bảo tính module hóa và dễ dàng kiểm thử.

### Phase 1: Nền tảng Core và Quản lý Người dùng (Xác thực & Phân quyền)
**Mục tiêu:** Xây dựng khung hệ thống, kết nối cơ sở dữ liệu và hoàn thiện hệ thống xác thực.
- **Backend (`be-hospital`)**:
  - Gắn kết cấu trúc Database (MySQL) sử dụng JPA/Hibernate dựa trên Schema thiết kế.
  - Tích hợp Spring Security & JWT cho quá trình Authentication & Authorization.
  - Xây dựng REST APIs: Đăng ký (UC01), Đăng nhập (UC02), Quản lý profile (UC03).
  - Phân quyền (Role: PATIENT, DOCTOR, RECEPTIONIST, ADMIN).
- **Frontend (`fe-hospital`)**:
  - Thiết lập UI Layout tổng thể, Routing.
  - Trang Đăng nhập, Đăng ký.
  - Trang Thông tin cá nhân người dùng.

### Phase 2: Quản lý Danh mục Hệ thống (Dành cho Admin)
**Mục tiêu:** Xây dựng dữ liệu nền (Master Data) để các luồng nghiệp vụ khác có thể hoạt động.
- **Backend (`be-hospital`)**:
  - APIs CRUD cho Chuyên khoa (UC18), Thuốc (UC21).
  - APIs CRUD cho Bác sĩ (UC17) và User nội bộ (UC16).
  - APIs thiết lập và lấy Lịch làm việc của Bác sĩ (UC19).
- **Frontend (`fe-hospital`)**:
  - Trang Admin Dashboard.
  - Các trang Quản lý danh mục (Bác sĩ, Chuyên khoa, Thuốc, Lịch làm việc).

### Phase 3: Luồng Đặt lịch khám và Lễ tân
**Mục tiêu:** Chức năng cốt lõi cho Bệnh nhân đặt lịch và Lễ tân tiếp nhận.
- **Backend (`be-hospital`)**:
  - API lấy danh sách Bác sĩ, Chuyên khoa cho bệnh nhân chọn (UC08).
  - APIs Đặt lịch (UC04) (kiểm tra rỗng khung giờ), Hủy lịch (UC05), Lịch sử khám (UC06).
  - APIs cho Lễ tân: Lấy danh sách chờ (UC09), Xác nhận/Từ chối lịch (UC10).
- **Frontend (`fe-hospital`)**:
  - Trang Đặt lịch khám (Chọn chuyên khoa -> Chọn bác sĩ -> Chọn ngày giờ).
  - Trang Quản lý Lịch sử đặt lịch của bệnh nhân.
  - Trang Lễ tân: Danh sách lịch hẹn trong ngày và thao tác Xác nhận.

### Phase 4: Luồng Bác sĩ khám bệnh
**Mục tiêu:** Hoàn thiện trải nghiệm của Bác sĩ từ lúc xem lịch đến khi kê đơn.
- **Backend (`be-hospital`)**:
  - APIs lấy danh sách bệnh nhân theo ngày làm việc của bác sĩ (UC12, UC13).
  - APIs Cập nhật trạng thái khám, Ghi nhận chẩn đoán (UC14).
  - APIs Kê đơn thuốc (liên kết Bệnh án - Thuốc) (UC15).
  - API Patient xem chi tiết đơn thuốc (UC20).
- **Frontend (`fe-hospital`)**:
  - Biểu đồ/Lịch làm việc của Bác sĩ.
  - Giao diện phòng khám ảo: Xem thông tin bệnh nhân, Form nhập chẩn đoán, Form search và thêm thuốc vào đơn.

### Phase 5: Báo cáo Thống kê & Chatbot AI
**Mục tiêu:** Nâng cao trải nghiệm người dùng và cung cấp góc nhìn quản lý.
- **Backend (`be-hospital`)**:
  - APIs Thống kê số liệu (Tổng lịch hẹn, doanh thu, tỷ lệ hủy...) cho Admin (UC11).
  - Xây dựng Webhook/Tích hợp API với NLP Engine (Dialogflow / GPT) để xử lý ý định người dùng (Intent).
- **Frontend (`fe-hospital`)**:
  - Biểu đồ thống kê (Chart.js / Recharts) cho Admin.
  - Tích hợp cửa sổ Chatbot UI ở góc màn hình cho Client.

---

## Verification Plan

### Automated Tests
- **Backend**: Viết Unit Test (JUnit + Mockito) cho các services quan trọng: `AuthService`, `AppointmentService` (đặc biệt logic kiểm tra trùng lịch / overbooking).
- Run: `mvn test` (Mục tiêu coverage > 70% các luồng chính).

### Manual Verification
- **E2E Testing (Luồng đi khám)**:
  1. Login Admin -> Tạo thông tin Bác sĩ, Lịch làm việc.
  2. Register/Login Bệnh nhân -> Đặt lịch khám với bác sĩ trên.
  3. Login Lễ tân -> Kiểm tra thấy lịch mới -> Nhấn "Xác nhận".
  4. Login Bác sĩ -> Thấy lịch của bệnh nhân -> Nhấn "Khám bệnh" -> Lưu chẩn đoán -> Kê đơn.
  5. Login Bệnh nhân -> Xem lại đơn thuốc vừa được kê.
- Kiểm tra lại các ràng buộc giao diện (Validate form, Authentication Guard cho các Route frontend).

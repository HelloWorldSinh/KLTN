# Mô tả chức năng hệ thống - Đăng ký khám bệnh trực tuyến kết hợp Chatbot

Tài liệu này mô tả chi tiết các chức năng của hệ thống dựa trên phân tích use case.

## 1. Tác nhân (Actor)

Hệ thống có 4 tác nhân chính:
- **Người bệnh:** Người dùng sử dụng hệ thống để đăng ký khám và tra cứu thông tin.
- **Điều dưỡng / Lễ tân:** Nhân viên tiếp nhận và xử lý các yêu cầu đăng ký khám.
- **Bác sĩ:** Thực hiện khám bệnh theo lịch đã được đăng ký.
- **Quản trị viên:** Quản lý và vận hành toàn bộ hệ thống.

## 2. Nhóm chức năng dành cho Người bệnh

### 2.1. Đăng ký tài khoản (UC01)
- **Mô tả:** Cho phép người bệnh chưa có tài khoản tạo tài khoản mới trong hệ thống.
- **Luồng chính:**
    1.  Hệ thống hiển thị form đăng ký.
    2.  Người dùng nhập thông tin và nhấn "Đăng ký".
    3.  Hệ thống kiểm tra tính hợp lệ và tạo tài khoản.
    4.  Hệ thống hiển thị thông báo thành công và chuyển hướng đến trang đăng nhập.
- **Yêu cầu phi chức năng:** Mật khẩu được mã hóa; Email và số điện thoại là duy nhất.

### 2.2. Đăng nhập (UC02)
- **Mô tả:** Cho phép người dùng đã có tài khoản đăng nhập vào hệ thống.
- **Luồng chính:**
    1.  Người dùng nhập thông tin đăng nhập và nhấn "Đăng nhập".
    2.  Hệ thống xác thực thông tin.
    3.  Nếu thành công, hệ thống tạo phiên đăng nhập và chuyển đến trang phù hợp với vai trò.
- **Yêu cầu phi chức năng:** Hoạt động 24/7.

### 2.3. Quản lý thông tin cá nhân (UC03)
- **Mô tả:** Cho phép người bệnh xem và cập nhật thông tin cá nhân.
- **Luồng chính:**
    1.  Người dùng chọn chức năng "Thông tin cá nhân".
    2.  Hệ thống hiển thị thông tin hiện tại.
    3.  Người dùng thay đổi thông tin và nhấn "Lưu thay đổi".
    4.  Hệ thống kiểm tra hợp lệ và cập nhật vào cơ sở dữ liệu.

### 2.4. Đăng ký lịch khám (UC04)
- **Mô tả:** Cho phép người bệnh đặt lịch hẹn khám bệnh trực tuyến.
- **Luồng chính:**
    1.  Người bệnh chọn chức năng "Đăng ký khám".
    2.  Chọn bác sĩ.
    3.  Chọn ngày khám mong muốn.
    4.  Chọn khung giờ trống.
    5.  Xác nhận thông tin và nhấn "Xác nhận đặt lịch".
    6.  Hệ thống tạo lịch hẹn với trạng thái "Chờ xác nhận" và thông báo thành công.
- **Luồng thay thế:**
    - **Xung đột lịch:** Nếu khung giờ vừa hết chỗ, hệ thống thông báo và yêu cầu chọn lại khung giờ khác.

### 2.5. Hủy lịch khám (UC05)
- **Mô tả:** Cho phép người bệnh hủy lịch hẹn đã đăng ký.
- **Luồng chính:**
    1.  Người bệnh chọn "Lịch hẹn của tôi".
    2.  Chọn lịch hẹn cần hủy.
    3.  Chọn lý do hủy và xác nhận.
    4.  Hệ thống cập nhật trạng thái lịch hẹn thành "Đã hủy" và giải phóng khung giờ.

### 2.6. Xem lịch sử khám (UC06)
- **Mô tả:** Cho phép người bệnh xem lại các lần khám bệnh đã thực hiện.
- **Luồng chính:**
    1.  Người bệnh chọn "Lịch sử khám bệnh".
    2.  Hệ thống hiển thị danh sách các lần khám theo thứ tự thời gian giảm dần.

### 2.7. Xem thông báo (UC07)
- **Mô tả:** Cho phép người bệnh xem các thông báo từ hệ thống (xác nhận lịch, nhắc lịch...).
- **Luồng chính:**
    1.  Người dùng nhấp vào biểu tượng thông báo.
    2.  Hệ thống hiển thị danh sách thông báo.
    3.  Người dùng nhấp vào một thông báo để xem chi tiết, hệ thống đánh dấu đã đọc.

### 2.8. Tra cứu thông tin bác sĩ, chuyên khoa (UC08)
- **Mô tả:** Cho phép người dùng tra cứu thông tin chi tiết về bác sĩ và chuyên khoa.
- **Luồng chính:**
    1.  Người dùng chọn "Đội ngũ bác sĩ".
    2.  Tìm kiếm hoặc lọc theo chuyên khoa.
    3.  Chọn một bác sĩ để xem chi tiết hồ sơ.

### 2.9. Xem đơn thuốc sau khi khám (UC20)
- **Mô tả:** Cho phép bệnh nhân xem lại đơn thuốc đã được bác sĩ kê sau khi khám.
- **Luồng chính:**
    1.  Bệnh nhân vào "Lịch sử khám".
    2.  Nhấp vào biểu tượng "Đơn thuốc" của lần khám muốn xem.
    3.  Hệ thống hiển thị trang chi tiết đơn thuốc (danh sách thuốc, liều dùng, hướng dẫn).

## 3. Nhóm chức năng dành cho Điều dưỡng / Lễ tân

### 3.1. Xem danh sách đăng ký khám (UC09)
- **Mô tả:** Cho phép điều dưỡng xem danh sách các lịch hẹn đã đăng ký.
- **Luồng chính:**
    1.  Điều dưỡng chọn "Quản lý lịch hẹn".
    2.  Hệ thống hiển thị danh sách lịch hẹn của ngày hiện tại.

## 4. Nhóm chức năng dành cho Bác sĩ

### 4.1. Xem lịch khám cá nhân (UC12)
- **Mô tả:** Cho phép bác sĩ xem lịch làm việc của mình.
- **Luồng chính:**
    1.  Bác sĩ chọn "Lịch khám".
    2.  Hệ thống hiển thị lịch khám theo ngày/tuần/tháng.

### 4.2. Xem danh sách lịch hẹn khám (UC13)
- **Mô tả:** Cho phép bác sĩ xem chi tiết các lịch hẹn khám của mình.
- **Luồng chính:**
    1.  Bác sĩ chọn "Danh sách bệnh nhân".
    2.  Hệ thống hiển thị danh sách lịch hẹn trong ngày.
    3.  Bác sĩ chọn một bệnh nhân để xem chi tiết thông tin.

### 4.3. Ghi nhận chẩn đoán (UC14)
- **Mô tả:** Cho phép bác sĩ ghi nhận triệu chứng và chẩn đoán cho bệnh nhân.
- **Luồng chính:**
    1.  Bác sĩ chọn bệnh nhân và nhấn "Bắt đầu khám".
    2.  Điền thông tin triệu chứng và chẩn đoán.
    3.  Nhấn "Hoàn tất khám".
    4.  Hệ thống lưu dữ liệu và cập nhật trạng thái đơn khám thành "Đã khám".

### 4.4. Kê đơn thuốc (UC15)
- **Mô tả:** Cho phép bác sĩ kê đơn thuốc cho bệnh nhân.
- **Luồng chính:**
    1.  Bác sĩ chọn tab "Kê đơn thuốc".
    2.  Thêm thuốc vào đơn (chọn thuốc, liều dùng, số lượng).
    3.  Nhấn nút "Lưu đơn thuốc".
    4.  Hệ thống lưu đơn thuốc và thông báo thành công.

## 5. Nhóm chức năng dành cho Quản trị viên

### 5.1. Báo cáo số liệu (UC11)
- **Mô tả:** Cho phép xem các báo cáo thống kê tổng hợp.
- **Luồng chính:**
    1.  Quản trị viên chọn "Báo cáo".
    2.  Hệ thống hiển thị trang dashboard với các chỉ số chính (tổng số lịch hẹn, bệnh nhân mới, tỷ lệ hủy...).

### 5.2. Quản lý tài khoản hệ thống (UC16)
- **Mô tả:** Cho phép quản lý tài khoản của bác sĩ, lễ tân.
- **Luồng chính:**
    1.  Chọn "Quản lý tài khoản".
    2.  Thực hiện các thao tác: thêm mới, xem danh sách, chỉnh sửa, xóa tài khoản.

### 5.4. Quản lý chuyên khoa (UC18)
- **Mô tả:** Cho phép quản lý danh mục các chuyên khoa.
- **Luồng chính:**
    1.  Chọn "Quản lý chuyên khoa".
    2.  Thực hiện các thao tác: thêm, sửa, xóa chuyên khoa.

### 5.5. Quản lý lịch làm việc (UC19)
- **Mô tả:** Cho phép thiết lập và quản lý lịch làm việc cho bác sĩ.
- **Luồng chính:**
    1.  Chọn "Quản lý lịch".
    2.  Chọn bác sĩ và thiết lập khung giờ làm việc, số lượng bệnh nhân tối đa.
    3.  Hệ thống lưu lịch và áp dụng.

### 5.6. Quản lý danh mục thuốc (UC21 - được đánh số lại)
- **Mô tả:** Cho phép quản lý danh sách thuốc trong hệ thống.
- **Luồng chính:**
    1.  Chọn "Quản lý danh mục thuốc".
    2.  Thực hiện các thao tác: thêm, sửa, xóa, tìm kiếm thông tin thuốc.
- **Luồng thay thế:**
    - **Lỗi trùng lặp:** Hệ thống thông báo nếu thuốc đã tồn tại.
    - **Xóa bị ràng buộc:** Nếu thuốc đã được kê, hệ thống đề xuất ẩn thay vì xóa.

## 6. Chức năng của Chatbot

- **Mô tả:** Chatbot là trợ lý ảo hỗ trợ người bệnh.
- **Các chức năng chính:**
    - Tiếp nhận và phân tích câu hỏi bằng ngôn ngữ tự nhiên.
    - Trả lời các câu hỏi thường gặp (FAQ) về quy trình, chi phí, giờ làm việc.
    - Hướng dẫn người bệnh thực hiện các bước đăng ký khám.
    - Hỗ trợ tra cứu thông tin lịch khám và thông tin bác sĩ.
    - Chuyển tiếp yêu cầu cho nhân viên y tế khi vượt quá khả năng xử lý.
- **Giới hạn:** Chatbot không thực hiện chẩn đoán y khoa, chỉ hỗ trợ thông tin và điều hướng quy trình.
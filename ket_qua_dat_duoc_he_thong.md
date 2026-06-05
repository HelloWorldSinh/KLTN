# KẾT QUẢ ĐẠT ĐƯỢC CỦA HỆ THỐNG (BÁO CÁO KHÓA LUẬN)

Dưới đây là nội dung chi tiết về **"Kết quả đạt được của hệ thống"** (Sản phẩm phần mềm và kết quả công nghệ), được viết theo ngôn ngữ học thuật chuẩn mực để bạn đưa vào chương **"Kết quả và Đánh giá"** hoặc làm phần mô tả sản phẩm trong khóa luận tốt nghiệp của mình.

---

## 1. Tổng Quan Về Sản Phẩm Hệ Thống

Sau quá trình nghiên cứu lý thuyết, phân tích thiết kế hệ thống và tiến hành xây dựng mã nguồn, đề tài đã hoàn thiện sản phẩm phần mềm **"Hệ thống Đăng ký khám bệnh trực tuyến kết hợp Chatbot AI (MediCare)"**. Hệ thống được xây dựng hoàn chỉnh dưới dạng ứng dụng Web đa phân hệ (Multi-module Web Application) với mô hình phát triển Client-Server:
*   **Phía máy khách (Client/Frontend):** Được xây dựng bằng **ReactJS, TypeScript và TailwindCSS**, tạo ra một giao diện hiện đại, trực quan, hỗ trợ thiết kế đáp ứng (Responsive Design) tương thích tốt trên cả máy tính (Desktop) và thiết bị di động (Mobile).
*   **Phía máy chủ (Server/Backend):** Được phát triển bằng framework **Spring Boot (Java)**, áp dụng kiến trúc phân tầng (Controller - Service - Repository) đảm bảo tính mở rộng, bảo mật cao và dễ dàng bảo trì.
*   **Tích hợp Trí tuệ nhân tạo (AI Integration):** Sử dụng thư viện **LangChain4j** để kết nối trực tiếp với mô hình ngôn ngữ lớn **Google Gemini (gemini-2.5-flash)**, kết hợp thư viện chạy local **ONNX** nhúng vector và cơ sở dữ liệu **MySQL** nhằm triển khai thành công mô hình tư vấn y tế thông minh RAG và gọi hàm (Tool Calling).

---

## 2. Chi Tiết Các Phân Hệ Chức Năng Đã Hoàn Thiện

Hệ thống đã hiện thực hóa đầy đủ 100% các Use Case đã thiết kế, phân chia rõ ràng quyền hạn và giao diện chuyên biệt cho 4 nhóm tác nhân chính:

### 2.1. Phân hệ dành cho Người bệnh (Patient Module)
*   **Đăng ký và xác thực tài khoản:** Đảm bảo an toàn thông tin với cơ chế mã hóa mật khẩu một chiều (BCrypt), kiểm tra tính duy nhất của số điện thoại và email đăng ký.
*   **Đặt lịch khám trực tuyến:** Cho phép người bệnh chủ động thực hiện theo quy trình 3 bước trực quan: Lọc chuyên khoa/Tìm kiếm bác sĩ $\rightarrow$ Chọn ngày trực và ca trực còn trống (Sáng/Chiều) $\rightarrow$ Kiểm tra thông tin tóm tắt và xác nhận đặt lịch.
*   **Hàng đợi khám trực tuyến (Online Queue System):** Cho phép người bệnh theo dõi từ xa số thứ tự đang được khám hiện tại tại phòng khám và số thứ tự của bản thân trong ngày, giúp chủ động thời gian di chuyển đến phòng khám.
*   **Quản lý hồ sơ cá nhân & lịch sử khám:** Cho phép người dùng chỉnh sửa thông tin liên lạc, theo dõi danh sách lịch hẹn (Sắp diễn ra, Hoàn thành, Đã hủy), xem chi tiết chẩn đoán của bác sĩ và xem đơn thuốc điện tử (tên thuốc, số lượng, liều dùng) sau khi khám xong.

### 2.2. Phân hệ dành cho Bác sĩ (Doctor Module)
*   **Xem lịch làm việc:** Giao diện lưới lịch trực quan hiển thị danh sách các ca trực được phân công theo tháng, đi kèm thông tin chi tiết về phòng khám và tỷ lệ lấp đầy bệnh nhân đăng ký của từng ca trực.
*   **Giao diện phòng khám:** Hỗ trợ bác sĩ theo dõi hàng đợi khám hiện tại của phòng, thực hiện tiếp nhận bệnh nhân vào khám theo đúng thứ tự.
*   **Ghi nhận thông tin khám:** Bác sĩ nhập triệu chứng lâm sàng, chẩn đoán bệnh và thực hiện kê đơn thuốc điện tử bằng cách tìm kiếm biệt dược trong kho thuốc hệ thống, nhập số lượng và liều dùng chi tiết.
*   **Yêu cầu hủy lịch trực:** Cho phép bác sĩ chủ động gửi yêu cầu xin nghỉ/hủy ca trực lên hệ thống trước ít nhất 2 ngày (kèm lý do cụ thể) để Admin phê duyệt.

### 2.3. Phân hệ dành cho Điều dưỡng / Lễ tân (Staff Module)
*   **Quản lý tiếp đón:** Cho phép nhân viên lễ tân tìm kiếm nhanh thông tin bệnh nhân qua số điện thoại khi họ đến phòng khám trực tiếp.
*   **Tiếp nhận hàng đợi:** Thực hiện xác nhận sự có mặt của bệnh nhân và kích hoạt chuyển trạng thái lịch khám từ "Đã xác nhận" (CONFIRMED) sang "Chờ khám" (WAITING) để đẩy bệnh nhân vào hàng đợi khám của bác sĩ.

### 2.4. Phân hệ Quản trị viên (Admin Module)
*   **Dashboard báo cáo thống kê:** Hiển thị biểu đồ phân tích trực quan về số lượt khám, top chuyên khoa có lượt khám cao nhất, tỷ lệ hủy ca trực và doanh thu dịch vụ. Đồng thời hiển thị banner cảnh báo nhấp nháy khi có yêu cầu hủy ca trực của bác sĩ đang chờ duyệt.
*   **Quản lý người dùng:** Thực hiện các tác vụ thêm mới, chỉnh sửa thông tin, phân quyền và khóa/mở khóa tài khoản đối với bác sĩ, nhân viên điều dưỡng và bệnh nhân.
*   **Quản lý danh mục chuyên khoa và kho thuốc:** Thêm, sửa, ẩn/xóa danh mục các chuyên khoa hiện hành và các loại biệt dược dùng trong kê đơn.
*   **Thiết lập lịch làm việc:** Cung cấp tính năng xếp lịch trực cho bác sĩ (tạo lịch trực đơn lẻ hoặc tạo lịch trực lặp lại hàng tuần theo các thứ tự trong khoảng thời gian xác định).
*   **Phê duyệt hủy lịch:** Admin duyệt hoặc từ chối yêu cầu hủy ca trực của bác sĩ. Khi duyệt hủy, hệ thống tự động cập nhật tất cả lịch hẹn của bệnh nhân trong ca đó thành "Hệ thống hủy" và gửi thông báo tự động đến người bệnh.

---

## 3. Kết Quả Nghiên Cứu và Ứng Dụng Công Nghệ AI

Đóng góp kỹ thuật quan trọng nhất của khóa luận là việc tích hợp thành công AI Agent vào hệ thống quản lý phòng khám thông qua các giải pháp công nghệ tiên tiến:

### 3.1. Ứng dụng mô hình RAG cục bộ hiệu năng cao (Local RAG)
Hệ thống đã triển khai thành công đường ống RAG (Retrieval-Augmented Generation) để trả lời các câu hỏi về quy định nội bộ của phòng khám:
*   Sử dụng mô hình nhúng cục bộ **All-MiniLM-L6-V2** chạy dưới dạng file ONNX trên môi trường máy chủ. Giải pháp này giúp hệ thống hoạt động hoàn toàn độc lập, không tốn chi phí gọi API nhúng của bên thứ ba, bảo mật tuyệt đối các dữ liệu tài liệu nội bộ.
*   Tài liệu FAQ được chia đoạn nhỏ (300 tokens/chunk, overlap 30) và lưu trữ dưới dạng vector trong bộ nhớ đệm (InMemory Vector Store). Khi người dùng hỏi, hệ thống tìm kiếm ngữ cảnh dựa trên độ tương đồng ngữ nghĩa (Cosine Similarity) với ngưỡng lọc tối thiểu `minScore = 0.6` để đính kèm vào prompt gửi cho Gemini, giúp loại bỏ hoàn toàn hiện tượng AI "bịa" thông tin dịch vụ.

### 3.2. Triển khai cơ chế Tool Calling liên kết Cơ sở dữ liệu an toàn
Để Chatbot có khả năng trả lời thông tin thời gian thực, hệ thống đã cấu hình cơ chế Tool Calling thông qua LangChain4j:
*   AI tự động phân tích câu hỏi ngôn ngữ tự nhiên để nhận diện ý định (Intent), sau đó ánh xạ và kích hoạt trực tiếp các hàm Java `@Tool` kết nối DB (bao gồm: `getSpecialties()`, `getDoctors()`, và `getAvailableSchedules()`).
*   Gemini đóng vai trò phân tích đầu vào để tự động trích xuất các đối số chính xác (ví dụ: chuyển từ "ngày mai" thành định dạng "YYYY-MM-DD", nhận diện đúng ID của bác sĩ được nhắc đến) để truyền vào hàm Java, sau đó nhận dữ liệu thô trả về từ DB để biên dịch thành câu trả lời tiếng Việt trôi chảy, tự nhiên cho người bệnh.

### 3.3. Cơ chế lưu trữ Chat Memory bền vững (Persistent Chat Memory)
Thay vì lưu trữ lịch sử chat trong bộ nhớ RAM dễ bị mất khi khởi động lại server, hệ thống đã triển khai `DatabaseChatMemoryStore` liên kết với MySQL:
*   Tự động lưu trữ và quản lý lịch sử chat của từng phiên (Session) trong database dưới cấu trúc JSON.
*   Giới hạn bộ nhớ 20 tin nhắn gần nhất (`maxMessages = 20`) để tối ưu hóa lượng token gửi lên API Gemini, giúp tiết kiệm chi phí vận hành và giữ cho thời gian phản hồi của chatbot luôn ổn định ($1.0\text{s} - 2.1\text{s}$).

---

## 4. Kết Luận Về Kết Quả Đạt Được

Hệ thống **MediCare** đã được xây dựng thành công, giải quyết triệt để bài toán đăng ký khám bệnh trực tuyến kết hợp với tư vấn tự động bằng trí tuệ nhân tạo. Sự kết hợp giữa **Spring Boot, React và LangChain4j** đã chứng minh tính thực tiễn cao, tạo ra một ứng dụng có giao diện hiện đại, luồng công việc chặt chẽ, tối ưu hóa quy trình thủ tục y khoa và cung cấp một trải nghiệm tương tác với trợ lý ảo vô cùng mượt mà, thông minh và an toàn cho người bệnh.

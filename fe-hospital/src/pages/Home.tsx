import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Shield, Clock, HelpCircle, Phone, Mail, MapPin } from 'lucide-react';
import heroBg from '../assets/sunshine_hero.png';
import { Header } from '../components/Header';

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).scrollToSection) {
      const sectionId = (location.state as any).scrollToSection;
      navigate('/', { replace: true, state: {} });
      
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location, navigate]);

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Hero Banner Section */}
      <section id="home" className="relative h-[650px] overflow-hidden flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        {/* Gradient Overlay (Blue-to-Teal transparent overlay mimicking screenshot) */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/75 via-teal-700/70 to-teal-500/65 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/10" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              CHÚNG TÔI Ở ĐÂY<br />LÀ VÌ SỨC KHỎE CỦA BẠN
            </h1>
            
            <p className="text-lg sm:text-xl font-medium text-slate-100 max-w-2xl mx-auto leading-relaxed">
              Người có sức khỏe là người có hy vọng - Người có hy vọng là người có tất cả. 
              Hãy trao cho chúng tôi niềm tin - Chúng tôi sẽ trao lại cho bạn hy vọng.
            </p>

            <div className="pt-4">
              <button
                onClick={() => handleNavClick('intro')}
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white rounded-xl text-base font-bold text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wide"
              >
                Tìm hiểu về chúng tôi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section id="intro" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-950">Về Sunshine Hospital</h2>
            <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-lg">
              Sunshine Hospital tự hào là đơn vị y tế hàng đầu cung cấp các dịch vụ chăm sóc sức khỏe toàn diện với công nghệ hiện đại và đội ngũ y bác sĩ giàu tâm huyết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-secondary border border-slate-100 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tận Tâm Chăm Sóc</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Chúng tôi đặt bệnh nhân làm trung tâm, lắng nghe và thấu hiểu để đưa ra phác đồ điều trị phù hợp nhất.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-secondary border border-slate-100 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Chất Lượng Vượt Trội</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hệ thống trang thiết bị đạt chuẩn quốc tế cùng quy trình kiểm soát nhiễm khuẩn nghiêm ngặt.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-secondary border border-slate-100 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Phục Vụ Nhanh Chóng</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ứng dụng công nghệ đăng ký và khám bệnh thông minh giúp giảm tối đa thời gian chờ đợi của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-950">Quy Trình Khám Bệnh</h2>
            <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-4 text-lg">
              Chỉ với 4 bước đơn giản, bạn có thể hoàn thành việc khám bệnh một cách an toàn và thuận tiện.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <span className="absolute -top-4 left-6 h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">1</span>
              <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">Đặt Lịch Hẹn</h4>
              <p className="text-slate-500 text-sm">Chọn bác sĩ, chuyên khoa và thời gian phù hợp trực tiếp trên website.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <span className="absolute -top-4 left-6 h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">2</span>
              <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">Nhận Số Thứ Tự</h4>
              <p className="text-slate-500 text-sm">Sau khi xác nhận lịch, bạn sẽ nhận được số thứ tự khám trực tuyến.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <span className="absolute -top-4 left-6 h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">3</span>
              <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">Thực Hiện Khám</h4>
              <p className="text-slate-500 text-sm">Đến phòng khám đúng giờ để bác sĩ trực tiếp tư vấn và thăm khám.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <span className="absolute -top-4 left-6 h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">4</span>
              <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">Nhận Đơn Thuốc</h4>
              <p className="text-slate-500 text-sm">Nhận kết quả và đơn thuốc điện tử lưu trữ trực tiếp trên hệ thống hồ sơ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-950">Thắc Mắc Thường Gặp</h2>
            <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-secondary border border-slate-100">
              <div className="flex gap-4">
                <HelpCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">Tôi cần mang giấy tờ gì khi đến khám?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Bạn nên mang theo CMND/CCCD, thẻ Bảo hiểm Y tế (nếu có) và hồ sơ bệnh án cũ hoặc đơn thuốc đang sử dụng gần nhất.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-secondary border border-slate-100">
              <div className="flex gap-4">
                <HelpCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">Làm thế nào để hủy lịch hẹn đã đặt?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Bạn có thể truy cập vào "Lịch của tôi" sau khi đăng nhập và nhấn "Hủy lịch", hoặc liên hệ hotline tối thiểu 2 giờ trước giờ hẹn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-secondary border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-950 mb-4">Liên Hệ Với Chúng Tôi</h2>
              <p className="text-slate-500 text-base mb-8">
                Mọi ý kiến đóng góp hoặc thắc mắc, vui lòng liên hệ với bộ phận chăm sóc khách hàng của Sunshine Hospital.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">Hotline: 1900 6868 (Hỗ trợ 24/7)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">Email: contact@sunshinehospital.vn</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">Địa chỉ: 123 Đường Ánh Sáng, Quận 1, TP. Hồ Chí Minh</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950 mb-6">Gửi Lời Nhắn</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Họ tên</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nhập họ tên của bạn" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Số điện thoại</label>
                  <input type="tel" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nhập số điện thoại" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lời nhắn</label>
                  <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Chúng tôi có thể giúp gì cho bạn?"></textarea>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-sm">Gửi đi</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm space-y-4">
          <p className="font-bold text-white tracking-wide">SUNSHINE HOSPITAL - Hết lòng vì dân - Nâng tầm y tế</p>
          <p>&copy; {new Date().getFullYear()} Sunshine Hospital App. Mọi quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

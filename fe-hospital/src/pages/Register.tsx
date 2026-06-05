import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { authService, type SignupRequest } from '../services/auth.service';
import { Header } from '../components/Header';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'MALE',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi (loại bỏ confirmPassword)
      const signupData: SignupRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        password: formData.password
      };

      const response = await authService.register(signupData);

      if (response.status) {
        alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
        navigate('/login');
      } else {
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Số điện thoại hoặc Email đã được sử dụng!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-xl w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-3 animate-pulse">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Tạo tài khoản Bệnh nhân</h2>
            <p className="text-sm text-gray-500 mt-1">Tham gia MediCare để bắt đầu quản lý sức khỏe của bạn</p>
          </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input
                name="fullName"
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input
                name="phone"
                type="tel"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
              <input
                name="dob"
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.dob}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select
                name="gender"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                name="address"
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nơi ở"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
              <input
                name="password"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white py-2.5 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
              }`}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
};

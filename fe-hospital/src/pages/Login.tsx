import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Header } from '../components/Header';

export const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ phone: phoneNumber, password });

      const user = useAuthStore.getState().user;

      if (user?.role === 'PATIENT') {
        sessionStorage.setItem('justLoggedIn', 'true');
      }

      switch (user?.role) {
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'DOCTOR': navigate('/doctor/patients'); break;
        case 'STAFF': navigate('/staff/appointments'); break;
        default: navigate('/patient/dashboard'); break;
      }
    } catch (err: any) {
      setError(err.message || 'Số điện thoại hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-3 animate-pulse">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Chào mừng đến với MediCare</h2>
            <p className="text-sm text-gray-500 mt-1">Đăng nhập vào tài khoản của bạn</p>
          </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
              }`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Đăng ký tại đây
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
};

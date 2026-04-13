import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Bell, Menu, Calendar, Users, Activity, Package, Stethoscope, Clock, ShieldAlert, UserCircle, ChevronDown, Settings, Key } from 'lucide-react';
import Chatbot from '../components/Chatbot';

export const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigation = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Activity },
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Quản lý chuyên khoa', href: '/admin/specialties', icon: ShieldAlert },
          { name: 'Schedules', href: '/admin/schedules', icon: Calendar },
          { name: 'Medicine Catalog', href: '/admin/medicines', icon: Package }
        ];
      case 'DOCTOR':
        return [
          { name: 'Lịch của tôi', href: '/doctor/schedule', icon: Calendar },
          { name: 'Danh sách bệnh nhân', href: '/doctor/patients', icon: Users },
          { name: 'Chẩn đoán & Đơn thuốc', href: '/doctor/diagnosis', icon: Stethoscope },
          { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircle },
        ];
      case 'STAFF':
        return [
          { name: 'Lịch hẹn', href: '/staff/appointments', icon: Clock },
          { name: 'Xác nhận lịch', href: '/staff/confirmations', icon: ShieldAlert },
          { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircle },
        ];
      case 'PATIENT':
      default:
        return [
          { name: 'Tổng quan', href: '/patient/dashboard', icon: Activity },
          { name: 'Đặt lịch khám', href: '/patient/book', icon: Calendar },
          { name: 'Lịch của tôi', href: '/patient/schedule', icon: Clock },
          { name: 'Lịch sử khám', href: '/patient/history', icon: ShieldAlert },
          { name: 'Tìm bác sĩ', href: '/patient/doctors', icon: Stethoscope },
          { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircle },
        ];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Activity className="text-primary h-6 w-6" />
            MediCare
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-primary hover:bg-primary-50"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center md:hidden">
            <Menu className="h-6 w-6 text-gray-500" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-primary transition-colors" title="Thông báo">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-xl transition-all border border-transparent hover:border-gray-200"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs text-gray-400 font-medium leading-none mb-1">Xin chào,</p>
                  <p className="text-sm font-bold text-gray-700 leading-none">{user?.name}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                      {user?.role}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Quản lý hồ sơ
                  </Link>

                  <Link
                    to="/profile" // Cùng trang profile nhưng có thể UI handle tab đổi mật khẩu
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    Đổi mật khẩu
                  </Link>

                  <div className="h-px bg-gray-50 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content area */}
        <main className="flex-1 overflow-y-auto bg-secondary p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MediCare App. Mọi quyền được bảo lưu. | Liên hệ: support@medicare.com
        </footer>
      </div>

      {/* Chatbot overlay */}
      {user?.role === 'PATIENT' && <Chatbot />}
    </div>
  );
};

import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Calendar, Users, Activity, Package, Stethoscope, Clock, ShieldAlert, UserCircle } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import { Header } from '../components/Header';

export const MainLayout = () => {
  const { user } = useAuthStore();

  const getNavigation = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Activity },
          { name: 'Quản lý người dùng', href: '/admin/users', icon: Users },
          { name: 'Quản lý chuyên khoa', href: '/admin/specialties', icon: ShieldAlert },
          { name: 'Quản lý lịch khám', href: '/admin/schedules', icon: Calendar },
          { name: 'Quản lý danh mục thuốc', href: '/admin/medicines', icon: Package }
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
          { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircle },
        ];
      case 'PATIENT':
      default:
        return [
          { name: 'Tổng quan', href: '/patient/dashboard', icon: Activity },
          { name: 'Đặt lịch khám', href: '/patient/book', icon: Calendar },
          { name: 'Lịch của tôi', href: '/patient/schedule', icon: Clock },
          { name: 'Hàng đợi khám', href: '/patient/queue', icon: Users },
          { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircle },
        ];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-secondary flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-slate-50/80 border-r border-slate-200/60 flex flex-col hidden md:flex shrink-0">
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border ${isActive
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(15,118,110,0.2)] border-primary'
                      : 'text-slate-600 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(15,118,110,0.15)] hover:border-primary border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-secondary p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MediCare App. Mọi quyền được bảo lưu. | Liên hệ: support@medicare.com
          </footer>
        </div>
      </div>

      {/* Chatbot overlay */}
      {user?.role === 'PATIENT' && <Chatbot />}
    </div>
  );
};

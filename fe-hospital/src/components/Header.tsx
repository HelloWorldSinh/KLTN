import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Activity, LogIn, ChevronDown, Settings, Key, LogOut, Menu, X, LayoutDashboard,
  Calendar, Users, Package, Clock, ShieldAlert, UserCircle, Bell
} from 'lucide-react';
import { notificationService, type NotificationDTO } from '../services/notification.service';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileNotificationOpen, setIsMobileNotificationOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  const isManagementRoute = location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/doctor') || 
    location.pathname.startsWith('/staff') || 
    location.pathname.startsWith('/patient') || 
    location.pathname === '/profile';

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu đọc tất cả:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      const handleNewNotification = () => {
        console.log('[Header] Nhận sự kiện có thông báo mới, đang làm mới danh sách...');
        fetchNotifications();
      };
      window.addEventListener('new-notification', handleNewNotification);
      return () => {
        window.removeEventListener('new-notification', handleNewNotification);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target as Node)) {
        setIsMobileNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'DOCTOR': return '/doctor/patients';
      case 'STAFF': return '/staff/appointments';
      case 'PATIENT': return '/patient/dashboard';
      default: return '/login';
    }
  };

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { label: 'Trang chủ', id: 'home' },
    { label: 'Giới thiệu', id: 'intro' },
    { label: 'Quy trình', id: 'workflow' },
    { label: 'Thắc mắc', id: 'faq' },
    { label: 'Liên hệ', id: 'contact' },
  ];

  const getManagementNavItems = () => {
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

  return (
    <header className="sticky top-0 bg-gradient-to-r from-primary to-primary-light shadow-md z-50 border-b border-primary/20">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-primary transition-all duration-300">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            MediCare
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {!isManagementRoute && navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-sm font-semibold text-teal-100 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth / Profile Dropdown (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user && user.role !== 'ADMIN' && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                title="Thông báo"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold min-w-4 h-4 flex items-center justify-center ring-2 ring-primary animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-gray-800">Thông báo của bạn</span>
                    {unreadCount > 0 ? (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer"
                      >
                        Đọc tất cả ({unreadCount})
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold">Đã đọc hết</span>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 px-2 py-1 text-left custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs font-medium">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = notif.isRead === false || notif.read === false;
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl transition-colors space-y-1 relative group ${
                              isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-xs leading-snug ${isUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                                {notif.title}
                              </p>
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[9px] text-primary font-bold hover:underline shrink-0 bg-transparent border-0 cursor-pointer hidden group-hover:block"
                                  title="Đánh dấu đã đọc"
                                >
                                  Đã đọc
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{notif.content}</p>
                            <p className="text-[9px] text-gray-400 font-medium">
                              {new Date(notif.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-xl transition-all border border-transparent hover:border-white/15 cursor-pointer text-white"
              >
                <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold border border-white/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-teal-200/95 font-medium leading-none mb-1">Xin chào,</p>
                  <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-teal-100/80 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                      {user.role}
                    </div>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors font-semibold"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Trang quản lý
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Quản lý hồ sơ
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    Đổi mật khẩu
                  </Link>

                  <div className="h-px bg-gray-50 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 text-left bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-teal-50 transition-all shadow-sm hover:shadow-md cursor-pointer animate-fade-in"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && user && user.role !== 'ADMIN' && (
            <div className="relative" ref={mobileNotificationRef}>
              <button
                onClick={() => setIsMobileNotificationOpen(!isMobileNotificationOpen)}
                className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
                title="Thông báo"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold min-w-4 h-4 flex items-center justify-center ring-2 ring-primary animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isMobileNotificationOpen && (
                <div className="absolute right-[-48px] mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-gray-800">Thông báo</span>
                    {unreadCount > 0 ? (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer"
                      >
                        Đọc tất cả ({unreadCount})
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold">Đã đọc hết</span>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 px-2 py-1 text-left custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs font-medium">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = notif.isRead === false || notif.read === false;
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl transition-colors space-y-1 relative group ${
                              isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-xs leading-snug ${isUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                                {notif.title}
                              </p>
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[9px] text-primary font-bold hover:underline shrink-0 bg-transparent border-0 cursor-pointer"
                                  title="Đánh dấu đã đọc"
                                >
                                  Đã đọc
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{notif.content}</p>
                            <p className="text-[9px] text-gray-400 font-medium">
                              {new Date(notif.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer border-0 bg-transparent"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-primary-light/20 bg-primary px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Navigation Links */}
          {isManagementRoute ? (
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-all"
              >
                Về Trang chủ
              </Link>
              {getManagementNavItems().map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-teal-100 hover:text-white hover:bg-white/10 transition-all"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-teal-100 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-0 bg-transparent"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="h-px bg-white/10 my-2" />

          <div>
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-white">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-teal-200 font-medium">{user.role}</p>
                </div>
                {!isManagementRoute && (
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-teal-100 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-white" />
                    Trang quản lý
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-teal-100 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Settings className="h-4 w-4" />
                  Quản lý hồ sơ
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all cursor-pointer border-0 text-left bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white text-primary rounded-xl text-sm font-bold hover:bg-teal-50 transition-all"
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

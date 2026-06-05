import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Stethoscope, ShieldAlert, Activity, Package, Calendar, 
  Clock, AlertCircle, CheckCircle, XCircle, ChevronRight, TrendingUp, HelpCircle
} from 'lucide-react';
import { adminService, type DashboardStatsResponse } from '../services/admin.service';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Không thể tải thống kê dashboard', err);
      setError('Không thể kết nối máy chủ để tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONFIRMED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'WAITING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CANCELLED':
      case 'SYSTEM_CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'WAITING': return 'Đang đợi';
      case 'IN_PROGRESS': return 'Đang khám';
      case 'PENDING': return 'Chờ xác nhận';
      case 'CANCELLED': return 'Bệnh nhân hủy';
      case 'SYSTEM_CANCELLED': return 'Hệ thống hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-gray-500 font-semibold animate-pulse">Đang thu thập số liệu thống kê...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 space-y-3 max-w-xl mx-auto my-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Lỗi tải dữ liệu</h3>
        <p className="text-sm">{error || 'Không tìm thấy dữ liệu thống kê.'}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Calculate percentages for status breakdown
  const totalAppointments = stats.totalAppointments || 1; // Avoid divide by zero
  const getPercentage = (count: number) => {
    return Math.round((count / totalAppointments) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white shadow-lg border border-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Chào mừng trở lại, Quản trị viên!</h1>
          <p className="text-teal-50 text-sm">Hệ thống đang hoạt động ổn định. Dưới đây là báo cáo số liệu hoạt động phòng khám.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-sm font-medium self-start md:self-auto">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Action alert for cancellations */}
      {stats.pendingCancelSchedules > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 text-white rounded-xl flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-amber-800 font-extrabold text-sm sm:text-base">Yêu cầu hủy lịch chưa xử lý</p>
              <p className="text-amber-700 text-xs sm:text-sm">Hiện có {stats.pendingCancelSchedules} yêu cầu xin hủy lịch trực của Bác sĩ cần bạn phê duyệt.</p>
            </div>
          </div>
          <Link
            to="/admin/schedules?tab=cancellations"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-amber-600 transition shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <span>Duyệt ngay</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bệnh nhân</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalPatients}</h3>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-500" /> Tài khoản hoạt động
            </p>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bác sĩ</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalDoctors}</h3>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Hồ sơ nhân sự
            </p>
          </div>
        </div>

        {/* Total Staff */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nhân viên</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalStaff}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Điều phối & Tiếp đón</p>
          </div>
        </div>

        {/* Total Specialties */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chuyên khoa</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalSpecialties}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Khoa khám hiện có</p>
          </div>
        </div>

        {/* Total Medicines */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kho thuốc</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalMedicines}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Danh mục biệt dược</p>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lượt đặt khám</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalAppointments}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Lịch hẹn được tạo</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Appointment status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800">Trạng thái lịch hẹn</h2>
            <p className="text-xs text-gray-500">Phân tích tỷ lệ trạng thái các ca khám đăng ký trên hệ thống</p>
          </div>

          <div className="space-y-4">
            {/* COMPLETED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  Đã hoàn thành
                </span>
                <span className="text-gray-900">{stats.statusCounts['COMPLETED'] || 0} ({getPercentage(stats.statusCounts['COMPLETED'] || 0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage(stats.statusCounts['COMPLETED'] || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* CONFIRMED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  Đã xác nhận (Lịch sắp tới)
                </span>
                <span className="text-gray-900">{stats.statusCounts['CONFIRMED'] || 0} ({getPercentage(stats.statusCounts['CONFIRMED'] || 0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage(stats.statusCounts['CONFIRMED'] || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* WAITING / IN_PROGRESS */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  Trong phòng chờ & đang khám
                </span>
                <span className="text-gray-900">
                  {((stats.statusCounts['WAITING'] || 0) + (stats.statusCounts['IN_PROGRESS'] || 0))} ({getPercentage((stats.statusCounts['WAITING'] || 0) + (stats.statusCounts['IN_PROGRESS'] || 0))}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage((stats.statusCounts['WAITING'] || 0) + (stats.statusCounts['IN_PROGRESS'] || 0))}%` }}
                ></div>
              </div>
            </div>

            {/* PENDING */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                  Đang chờ duyệt xác nhận
                </span>
                <span className="text-gray-900">{stats.statusCounts['PENDING'] || 0} ({getPercentage(stats.statusCounts['PENDING'] || 0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage(stats.statusCounts['PENDING'] || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* CANCELLED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  Đã hủy (Bệnh nhân & Hệ thống)
                </span>
                <span className="text-gray-900">
                  {((stats.statusCounts['CANCELLED'] || 0) + (stats.statusCounts['SYSTEM_CANCELLED'] || 0))} ({getPercentage((stats.statusCounts['CANCELLED'] || 0) + (stats.statusCounts['SYSTEM_CANCELLED'] || 0))}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getPercentage((stats.statusCounts['CANCELLED'] || 0) + (stats.statusCounts['SYSTEM_CANCELLED'] || 0))}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold">Tỷ lệ khám thành công</p>
              <p className="text-lg font-black text-emerald-600 mt-1">
                {getPercentage(stats.statusCounts['COMPLETED'] || 0)}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold">Tỷ lệ hủy lịch</p>
              <p className="text-lg font-black text-rose-500 mt-1">
                {getPercentage((stats.statusCounts['CANCELLED'] || 0) + (stats.statusCounts['SYSTEM_CANCELLED'] || 0))}%
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Appointments (Takes 2/3 width on desktop) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Lịch hẹn mới nhất</h2>
              <p className="text-xs text-gray-500">Danh sách các lịch hẹn khám bệnh vừa đăng ký gần đây</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">Top 10 mới nhất</span>
          </div>

          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-150">
                  <tr>
                    <th className="py-3 px-4">Bệnh nhân</th>
                    <th className="py-3 px-4">Bác sĩ phụ trách</th>
                    <th className="py-3 px-4">Thời gian ca khám</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentAppointments && stats.recentAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-gray-900">{app.patientName || 'Không rõ'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{app.patientPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-gray-850">BS. {app.doctorName || 'Không rõ'}</p>
                        <p className="text-[10px] text-primary font-semibold mt-0.5">{app.specialtyName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-gray-700">{app.workDate ? new Date(app.workDate).toLocaleDateString('vi-VN') : ''}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-gray-400" /> {app.timeSlot}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(app.status)}`}>
                          {getStatusName(app.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400 font-medium">
                        {app.createdAt ? new Date(app.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </td>
                    </tr>
                  ))}
                  {(!stats.recentAppointments || stats.recentAppointments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 font-semibold">
                        Không có dữ liệu lịch hẹn gần đây.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

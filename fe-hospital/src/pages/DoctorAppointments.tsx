import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Phone,
  MapPin as MapPinIcon,
  CalendarDays,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { appointmentService, type DoctorAppointmentDTO } from '../services/appointment.service';
import toast from 'react-hot-toast';

export const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DoctorAppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.patientPhone.includes(searchTerm);
    const matchesDate = app.workDate === selectedDate;
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">Đã hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">Đã hủy</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CalendarDays className="text-primary w-8 h-8" />
            Danh sách bệnh nhân
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi và quản lý lịch hẹn khám của bạn.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên, SDT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 w-64 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold px-3 py-1.5"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform">
            <User className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bệnh nhân</h3>
          <p className="text-gray-500 max-w-sm">Chưa có lịch hẹn nào được đăng ký cho ngày này hoặc tiêu chí tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin liên lạc</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAppointments.map(app => (
                  <tr key={app.appointmentId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg">
                          {app.patientName.charAt(0)}
                        </div>
                        <div>
                          <p
                            onClick={() => navigate(`/doctor/examination/${app.appointmentId}`)}
                            className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                          >
                            {app.patientName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{app.patientGender}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{new Date().getFullYear() - new Date(app.patientDob).getFullYear()} tuổi</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {app.patientPhone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 max-w-[200px] truncate">
                          <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                          {app.patientAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          {app.startTime.substring(0, 5)} - {app.endTime.substring(0, 5)}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          Phòng: {app.room}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => navigate(`/doctor/examination/${app.appointmentId}`)}
                        title={app.status === 'COMPLETED' ? 'Xem lại hồ sơ' : 'Bắt đầu khám'}
                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

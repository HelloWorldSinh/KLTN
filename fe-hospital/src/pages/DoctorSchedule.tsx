import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Loader2,
  CalendarDays,
  MoreVertical
} from 'lucide-react';
import { appointmentService, type DoctorAppointmentDTO } from '../services/appointment.service';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DoctorAppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Lỗi khi tải lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  // Days from previous month
  const prevMonthNumDays = daysInMonth(year, month - 1);
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthNumDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthNumDays - i) });
  }
  // Days from current month
  for (let i = 1; i <= numDays; i++) {
    days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
  }
  // Days from next month
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.workDate === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CalendarDays className="text-primary w-8 h-8" />
            Lịch khám bệnh
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý thời gian và lịch hẹn của bạn hiệu quả.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/5 active:scale-95"
          >
            Hôm nay
          </button>
          
          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-gray-800 min-w-[140px] text-center">
              {monthNames[month]}, {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div key={day} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((item, index) => {
              const dayAppointments = getAppointmentsForDate(item.date);
              const today = isToday(item.date);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[140px] border-r border-b border-gray-50 p-3 transition-colors hover:bg-gray-50/30 group relative",
                    !item.currentMonth && "bg-gray-50/20 opacity-40",
                    index % 7 === 6 && "border-r-0"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-black transition-all",
                      today ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-700",
                      !item.currentMonth && "text-gray-400"
                    )}>
                      {item.day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {dayAppointments.length} ca
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 overflow-y-auto max-h-[90px] custom-scrollbar pr-1">
                    {dayAppointments.slice(0, 3).map((app) => (
                      <div
                        key={app.appointmentId}
                        onClick={() => navigate(`/doctor/examination/${app.appointmentId}`)}
                        className={cn(
                          "text-[11px] p-2 rounded-lg cursor-pointer transition-all border border-transparent shadow-sm truncate",
                          app.status === 'CONFIRMED' && "bg-blue-50 text-blue-700 hover:border-blue-200",
                          app.status === 'COMPLETED' && "bg-emerald-50 text-emerald-700 hover:border-emerald-200",
                          app.status === 'CANCELLED' && "bg-red-50 text-red-700 hover:border-red-200",
                          app.status === 'PENDING' && "bg-amber-50 text-amber-700 hover:border-amber-200"
                        )}
                      >
                         <div className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {app.startTime.substring(0, 5)}
                         </div>
                         <div className="opacity-80 font-medium truncate">
                            {app.patientName}
                         </div>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-[10px] text-center text-gray-400 font-bold py-1">
                         + {dayAppointments.length - 3} lịch hẹn khác
                      </div>
                    )}
                  </div>

                  {/* Desktop Hover Action */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend / Info */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span className="text-xs font-bold text-gray-500">Đã xác nhận</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-xs font-bold text-gray-500">Đã hoàn thành</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
            <span className="text-xs font-bold text-gray-500">Đã hủy</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span className="text-xs font-bold text-gray-500">Đang chờ</span>
         </div>
      </div>
    </div>
  );
};

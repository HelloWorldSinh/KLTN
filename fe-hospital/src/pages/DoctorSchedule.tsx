import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  MapPin,
  AlertCircle,
  Trash2,
  History
} from 'lucide-react';
import { userService } from '../services/user.service';
import { scheduleService, type ScheduleDTO } from '../services/schedule.service';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDateSchedules, setSelectedDateSchedules] = useState<ScheduleDTO[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'calendar' | 'cancellations'>('calendar');

  // Cancellation States
  const [cancelTargetSchedule, setCancelTargetSchedule] = useState<ScheduleDTO | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleRequestCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTargetSchedule || !cancelTargetSchedule.id) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    setSubmittingCancel(true);
    try {
      const res = await scheduleService.requestCancelSchedule(cancelTargetSchedule.id, cancelReason);
      if (res.status) {
        toast.success('Đã gửi yêu cầu, chờ phê duyệt');
        setIsCancelModalOpen(false);
        setIsModalOpen(false);
        setCancelReason('');
        setCancelTargetSchedule(null);
        fetchSchedules();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng liên hệ Admin.';
      toast.error(errMsg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const profile = await userService.getProfile();
      if (profile && profile.id) {
        const data = await scheduleService.getSchedulesByDoctor(profile.id);
        setSchedules(data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
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

  const getSchedulesForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return schedules.filter(s => s.workDate === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const cancelRequests = schedules.filter(s =>
    s.status === "PENDING_CANCEL" ||
    s.status === "CANCELLED" ||
    s.status === "REJECTED_CANCEL"
  ).sort((a, b) => b.workDate.localeCompare(a.workDate));

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CalendarDays className="text-primary w-8 h-8" />
            Lịch làm việc của tôi
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý thời gian ca trực của bạn hiệu quả.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/5 active:scale-95 cursor-pointer"
          >
            Hôm nay
          </button>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-150 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 rounded-xl text-gray-650 transition-all cursor-pointer hover:text-primary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-gray-800 min-w-[140px] text-center">
              {monthNames[month]}, {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 rounded-xl text-gray-650 transition-all cursor-pointer hover:text-primary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-150 gap-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            "py-3 px-6 font-bold border-b-2 transition-all text-sm flex items-center gap-2 -mb-[2px] cursor-pointer",
            activeTab === 'calendar'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          Lịch làm việc
        </button>
        <button
          onClick={() => setActiveTab('cancellations')}
          className={cn(
            "py-3 px-6 font-bold border-b-2 transition-all text-sm flex items-center gap-2 -mb-[2px] cursor-pointer",
            activeTab === 'cancellations'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <History className="w-4 h-4" />
          Yêu cầu hủy lịch
          {schedules.filter(s => s.status === 'PENDING_CANCEL').length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {schedules.filter(s => s.status === 'PENDING_CANCEL').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <>
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
              const daySchedules = getSchedulesForDate(item.date).sort((a, b) => a.startTime.localeCompare(b.startTime));
              const today = isToday(item.date);
              const hasSchedules = daySchedules.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (hasSchedules) {
                      setSelectedDateSchedules(daySchedules);
                      setSelectedDateStr(item.date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }));
                      setIsModalOpen(true);
                    }
                  }}
                  className={cn(
                    "min-h-[110px] p-2.5 transition-all relative flex flex-col justify-between",
                    !item.currentMonth && "opacity-30 pointer-events-none bg-slate-100/10",
                    hasSchedules
                      ? "bg-gradient-to-br from-teal-50/40 to-teal-100/60 hover:from-teal-50/60 hover:to-teal-100/70 border-r border-b border-teal-200 cursor-pointer hover:shadow-[inset_0_2px_4px_rgba(15,118,110,0.06)] active:scale-[0.99]"
                      : "bg-white border-r border-b border-gray-200",
                    index % 7 === 6 && "border-r-0"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-full text-sm font-black transition-all",
                        today ? "bg-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10" : "text-gray-800",
                        !item.currentMonth && "text-gray-300"
                      )}>
                        {item.day}
                      </span>
                      {hasSchedules && (
                        <span className="bg-teal-100/80 text-teal-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-teal-200/50 shadow-sm">
                          {daySchedules.length} ca trực
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {daySchedules.map((s) => (
                        <div
                          key={s.id}
                          className={cn(
                            "border rounded-xl p-2 text-[10.5px] font-bold flex flex-col shadow-sm gap-0.5 hover:border-primary/20 transition-colors",
                            s.status === "PENDING_CANCEL"
                              ? "bg-amber-50/95 border-amber-200 text-amber-800 line-through decoration-amber-500/40"
                              : "bg-white/90 border-teal-100/60 text-teal-800"
                          )}
                        >
                          <span className={cn("font-extrabold", s.status === "PENDING_CANCEL" ? "text-amber-700" : "text-slate-800")}>
                            {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                          </span>
                          <span className="text-[9.5px] font-bold mt-0.5 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 opacity-70" />
                            {s.room} {s.status === "PENDING_CANCEL" && "(Chờ hủy)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend / Info */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2.5 bg-teal-50/40 px-4 py-2.5 rounded-2xl border border-teal-100 shadow-sm">
          <div className="w-4 h-4 rounded-xl bg-teal-500 shadow-sm shadow-teal-500/20" />
          <span className="text-xs font-extrabold text-teal-800">Ngày làm việc</span>
        </div>
        <div className="flex items-center gap-2.5 bg-amber-50/50 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-sm">
          <div className="w-4 h-4 rounded-xl bg-amber-500 shadow-sm shadow-amber-500/20" />
          <span className="text-xs font-extrabold text-amber-800">Ca trực chờ duyệt hủy</span>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-50/40 px-4 py-2.5 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="w-4 h-4 rounded-xl bg-slate-350 shadow-sm shadow-slate-350/20" />
          <span className="text-xs font-extrabold text-slate-500">Ngày nghỉ / Không có ca trực</span>
        </div>
      </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {cancelRequests.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Chưa có yêu cầu hủy lịch làm việc nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelRequests.map((req) => {
                let statusBadge = null;
                if (req.status === 'PENDING_CANCEL') {
                  statusBadge = (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow-sm">
                      Chờ duyệt
                    </span>
                  );
                } else if (req.status === 'CANCELLED') {
                  statusBadge = (
                    <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold shadow-sm">
                      Đã hủy
                    </span>
                  );
                } else if (req.status === 'REJECTED_CANCEL') {
                  statusBadge = (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold shadow-sm">
                      Từ chối
                    </span>
                  );
                }

                return (
                  <div key={req.id} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Ngày trực</span>
                        <h4 className="font-extrabold text-slate-800 text-base">{req.workDate}</h4>
                      </div>
                      {statusBadge}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100/60">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Thời gian</span>
                        <span className="text-xs font-bold text-slate-700">{req.startTime.substring(0, 5)} - {req.endTime.substring(0, 5)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Phòng</span>
                        <span className="text-xs font-bold text-slate-700">{req.room}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 mt-2 space-y-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Lý do hủy</span>
                      <p className="text-xs font-medium text-slate-650 italic">"{req.cancelReason || 'Không có lý do'}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Form Modal */}
      {isCancelModalOpen && cancelTargetSchedule && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setCancelReason('');
          }}
          title="Yêu cầu hủy lịch làm việc"
          icon={AlertCircle}
          maxWidth="sm"
        >
          <form onSubmit={handleRequestCancel} className="p-6 space-y-5">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-sm text-slate-650">
              <div>
                <span className="font-bold text-slate-500">Ngày làm việc: </span>
                <span className="font-black text-slate-800">{cancelTargetSchedule.workDate}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Ca trực: </span>
                <span className="font-black text-slate-800">
                  {cancelTargetSchedule.startTime.substring(0, 5)} - {cancelTargetSchedule.endTime.substring(0, 5)}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Phòng trực: </span>
                <span className="font-black text-slate-800">{cancelTargetSchedule.room}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider">
                Lý do hủy ca trực <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelReason('');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors cursor-pointer text-sm"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submittingCancel}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-650/10 active:scale-95"
              >
                {submittingCancel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Xác nhận gửi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Chi tiết ca trực - ${selectedDateStr}`}
          icon={CalendarDays}
          maxWidth="md"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {selectedDateSchedules.map((s) => {
                const isMorning = s.startTime.localeCompare("12:00:00") < 0;

                return (
                  <div key={s.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />

                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <span className="inline-block text-[10px] uppercase font-black tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md mb-1.5">
                          {isMorning ? 'Ca Sáng' : 'Ca Chiều'}
                        </span>
                        <h4 className="font-extrabold text-slate-850 text-base">
                          {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {s.room}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Bệnh nhân đã đặt</span>
                        <span className="text-2xl font-black text-primary">{s.appointmentCount || 0}</span>
                        <span className="text-xs text-slate-400 font-medium"> / {s.slot} slot</span>
                      </div>
                    </div>

                    {s.status === "PENDING_CANCEL" ? (
                      <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold shadow-sm">
                        <AlertCircle className="w-4 h-4" />
                        Đang chờ duyệt hủy ca trực...
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCancelTargetSchedule(s);
                          setIsCancelModalOpen(true);
                          setIsModalOpen(false);
                        }}
                        className="mt-3 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Yêu cầu hủy ca trực
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

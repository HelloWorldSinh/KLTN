import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CalendarDays,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { queueService, type DoctorQueueResponse, type ScheduleDTO } from '../services/queue.service';
import { useAuthStore } from '../store/authStore';
import { useSSE } from '../hooks/useSSE';

export const StaffQueue = () => {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [queueData, setQueueData] = useState<DoctorQueueResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [_timeTick, setTimeTick] = useState(0);

  // Tự động làm mới bộ đếm thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bước 1: Lấy danh sách lịch khám hôm nay của tất cả bác sĩ
  const fetchSchedules = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await queueService.getTodaySchedulesForStaff();
      setSchedules(data);
      if (data.length > 0 && !selectedScheduleId) {
        setSelectedScheduleId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách ca khám hôm nay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(true);
  }, []);

  // Bước 2: Lấy hàng đợi của ca khám đang chọn
  const fetchQueue = async (showLoading = false) => {
    if (!selectedScheduleId) return;
    if (showLoading) setQueueLoading(true);
    try {
      const data = await queueService.getDoctorQueue(selectedScheduleId);
      setQueueData(data);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải thông tin hàng đợi');
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScheduleId) {
      fetchQueue(true);
    } else {
      setQueueData(null);
    }
  }, [selectedScheduleId]);

  // Kết nối SSE để đồng bộ hàng đợi theo thời gian thực khi bác sĩ thay đổi trạng thái khám
  useSSE({
    url: token && selectedScheduleId ? `http://localhost:1111/sse/connect?token=${token}&scheduleId=${selectedScheduleId}` : '',
    enabled: !!(token && selectedScheduleId),
    eventListeners: {
      queue_update: () => {
        console.log('[SSE] Nhận sự kiện cập nhật hàng đợi từ server. Đang làm mới...');
        fetchQueue(false);
      }
    }
  }, [token, selectedScheduleId]);

  // Hàm tính toán số giây còn lại cho bệnh nhân vắng mặt (30 phút = 1800 giây)
  const getAbsentRemainingSeconds = (absentAtStr: string) => {
    if (!absentAtStr) return 0;
    const absentAt = new Date(absentAtStr);
    const now = new Date();
    const diffMs = now.getTime() - absentAt.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const remaining = 1800 - diffSecs;
    return remaining > 0 ? remaining : 0;
  };

  // Format hiển thị phút:giây còn lại
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Xử lý gọi lại bệnh nhân vắng mặt
  const handleRecall = async (appointmentId: number, patientName: string) => {
    if (!window.confirm(`Xác nhận gọi lại bệnh nhân ${patientName} vào hàng đợi?`)) return;
    setActionLoading(appointmentId);
    try {
      const res = await queueService.recallPatient(appointmentId);
      if (res.status) {
        toast.success(res.message || 'Đã gọi lại bệnh nhân thành công');
        fetchQueue(false);
      } else {
        // Hiển thị toast lỗi màu đỏ nếu quá hạn 30 phút và bị backend từ chối
        toast.error(res.message || 'Không thể gọi lại bệnh nhân');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi hệ thống khi thực hiện gọi lại');
    } finally {
      setActionLoading(null);
    }
  };

  // Lọc lịch khám theo ô tìm kiếm
  const filteredSchedules = schedules.filter(s =>
    s.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);

  // Phân chia hàng đợi đang hoạt động và bệnh nhân vắng mặt
  const activeQueue = queueData?.queueList.filter(item => item.status !== 'MISSED') || [];
  const absentQueue = queueData?.queueList.filter(item => item.status === 'MISSED') || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-primary/10 rounded-2xl text-primary inline-block">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Điều phối Tiếp đón & Hàng đợi</h1>
          </div>
          <p className="text-slate-400 mt-1 font-semibold text-xs uppercase tracking-wider">
            Phân hệ dành cho Điều dưỡng/Lễ tân
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedSchedule && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-2 text-sm text-slate-700 font-bold">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Phòng khám: {selectedSchedule.room}</span>
            </div>
          )}

          <button
            onClick={() => {
              fetchSchedules(false);
              fetchQueue(false);
            }}
            disabled={loading || queueLoading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-500 rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60"
            title="Đồng bộ danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || queueLoading) ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-500 font-semibold">Đang tải dữ liệu ca trực hôm nay...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Không có ca khám nào hôm nay</h3>
          <p className="text-gray-500 max-w-sm">Hiện tại chưa có lịch trực hoặc lịch khám nào hoạt động trong ngày hôm nay.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI (Rộng 2/3): HÀNG ĐỢI KHÁM & BỘ LỌC BÁC SĨ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              
              {/* Thanh Tìm kiếm và Chọn Lịch Khám / Bác sĩ */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      Ca khám đang diễn ra hôm nay
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Chọn bác sĩ hoặc phòng để điều phối hàng đợi</p>
                  </div>
                  
                  {/* Ô tìm kiếm bác sĩ */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên bác sĩ hoặc phòng khám..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-700"
                    />
                  </div>
                </div>
                
                {/* Danh sách ca trực/bác sĩ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {filteredSchedules.length === 0 ? (
                    <p className="text-xs font-bold text-red-500 py-2">Không tìm thấy ca khám phù hợp.</p>
                  ) : (
                    filteredSchedules.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScheduleId(s.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selectedScheduleId === s.id
                            ? 'bg-primary border-primary text-white shadow-[0_4px_12px_rgba(15,118,110,0.2)]'
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 text-slate-700'
                        }`}
                      >
                        <h4 className="font-extrabold text-xs tracking-tight">{s.doctorName}</h4>
                        <p className={`text-[10px] mt-1 font-semibold ${selectedScheduleId === s.id ? 'text-teal-50' : 'text-slate-400'}`}>
                          {s.room} | {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chi tiết Hàng đợi khám thực tế */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {selectedSchedule ? `Hàng chờ của BS. ${selectedSchedule.doctorName}` : 'Hàng đợi khám'}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                    {activeQueue.length} người chờ
                  </span>
                </div>

                {queueLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : activeQueue.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">Hàng đợi khám trống</h4>
                    <p className="text-xs text-slate-500 mt-1">Tất cả bệnh nhân đã khám xong hoặc chưa có ai đăng ký ca này.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeQueue.map(p => (
                      <div
                        key={p.appointmentId}
                        className={`border rounded-2xl p-4 transition-all flex items-center justify-between ${
                          p.status === 'IN_PROGRESS'
                            ? 'bg-emerald-50/40 border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.03)]'
                            : p.displayStatus === 'Chuẩn bị'
                              ? 'bg-amber-50/40 border-amber-100'
                              : 'bg-slate-50/30 border-slate-100/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                            p.status === 'IN_PROGRESS'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : p.displayStatus === 'Chuẩn bị'
                                ? 'bg-amber-500 text-white'
                                : 'bg-primary/10 text-primary'
                          }`}>
                            {p.queuePosition}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{p.patientName}</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Vị trí hàng đợi: {p.queuePosition}</p>
                          </div>
                        </div>

                        <div>
                          {p.status === 'IN_PROGRESS' ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                              Đang khám
                            </span>
                          ) : p.displayStatus === 'Chuẩn bị' ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black">
                              Chuẩn bị
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black">
                              Chờ khám
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (Rộng 1/3): BỆNH NHÂN VẮNG MẶT & ĐẾM NGƯỢC 30 PHÚT */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[560px] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                Đã đánh vắng (Chờ gọi lại)
              </h3>
              <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
                {absentQueue.length} bệnh nhân
              </span>
            </div>

            {/* Hướng dẫn quy tắc 30 phút */}
            <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100/60 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                Quy tắc 30 phút: Nếu bệnh nhân liên hệ gọi lại trong vòng 30 phút sẽ được ưu tiên xếp vào <b>vị trí thứ 3</b>. Nếu vượt quá 30 phút, hệ thống sẽ <b>từ chối thao tác Gọi lại</b>.
              </div>
            </div>

            {/* Danh sách vắng mặt thực tế */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {queueLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : absentQueue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-center">Không có bệnh nhân vắng mặt của ca khám này</p>
                </div>
              ) : (
                absentQueue.map(p => {
                  const remainingSec = p.absentAt ? getAbsentRemainingSeconds(p.absentAt) : 0;
                  const isTimeUp = remainingSec <= 0;

                  return (
                    <div
                      key={p.appointmentId}
                      className={`border rounded-2xl p-4 transition-all ${
                        isTimeUp ? 'bg-red-50/20 border-red-100/60' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{p.patientName}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Số STT ban đầu: {p.queuePosition}</p>
                        </div>

                        {/* Đếm ngược thời gian thực */}
                        <div className="text-right">
                          {isTimeUp ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                              Quá hạn 30p
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span className="font-mono text-xs font-black text-slate-800">
                                {formatCountdown(remainingSec)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed border-slate-200/60">
                        {isTimeUp ? (
                          <button
                            onClick={() => handleRecall(p.appointmentId, p.patientName)}
                            disabled={actionLoading === p.appointmentId}
                            className="flex-1 py-2 px-3 bg-slate-300 text-slate-600 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1 hover:bg-red-500 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Quá hạn (Bấm thử để test từ chối)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRecall(p.appointmentId, p.patientName)}
                            disabled={actionLoading === p.appointmentId}
                            className="flex-1 py-2 px-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl text-xs font-black hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {actionLoading === p.appointmentId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PhoneCall className="w-3.5 h-3.5" />
                            )}
                            Gọi lại (Ưu tiên vị trí 3)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

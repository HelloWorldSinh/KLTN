import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  MapPin,
  Play,
  UserX,
  PhoneCall,
  Loader2,
  RefreshCw,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';
import { queueService, type DoctorQueueResponse, type DoctorQueueItemDTO, type ScheduleSummary } from '../services/queue.service';
import toast from 'react-hot-toast';
import { useSSE } from '../hooks/useSSE';
import { useAuthStore } from '../store/authStore';

export const DoctorQueue = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [queueData, setQueueData] = useState<DoctorQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Bước 1: Lấy danh sách schedule hôm nay
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const todaySchedules = await queueService.getTodaySchedules();
        setSchedules(todaySchedules);
        if (todaySchedules.length > 0) {
          setSelectedScheduleId(todaySchedules[0].id);
        }
      } catch {
        toast.error('Lỗi khi tải lịch khám');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Bước 2: Lấy hàng đợi khi chọn schedule
  const fetchQueue = async (showLoading = false) => {
    if (!selectedScheduleId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await queueService.getDoctorQueue(selectedScheduleId);
      setQueueData(res);
      setLastUpdated(new Date());
    } catch {
      toast.error('Lỗi khi tải hàng đợi');
    } finally {
      setLoading(false);
    }
  };

  // Kết nối SSE thời gian thực để cập nhật hàng đợi của bác sĩ
  useSSE({
    url: token && selectedScheduleId ? `http://localhost:1111/sse/connect?token=${token}&scheduleId=${selectedScheduleId}` : '',
    enabled: !!(token && selectedScheduleId),
    eventListeners: {
      queue_update: () => {
        console.log('[SSE] Bác sĩ nhận sự kiện cập nhật hàng đợi. Đang tải dữ liệu mới...');
        fetchQueue(false);
      }
    }
  }, [token, selectedScheduleId]);

  useEffect(() => {
    if (selectedScheduleId) {
      fetchQueue(true);
    }
  }, [selectedScheduleId]);

  // === Hành động ===
  const handleStart = async (appointmentId: number) => {
    setActionLoading(appointmentId);
    try {
      const res = await queueService.startExamination(appointmentId);
      if (res.status) {
        toast.success(res.message);
        navigate(`/doctor/examination/${appointmentId}`);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi bắt đầu khám');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAbsent = async (appointmentId: number) => {
    if (!window.confirm('Xác nhận bệnh nhân này vắng mặt?')) return;
    setActionLoading(appointmentId);
    try {
      const res = await queueService.markAbsent(appointmentId);
      if (res.status) {
        toast.success(res.message);
        fetchQueue(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi đánh dấu vắng mặt');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecall = async (appointmentId: number) => {
    if (!window.confirm('Gọi lại bệnh nhân này vào hàng đợi (sau 2 người)?')) return;
    setActionLoading(appointmentId);
    try {
      const res = await queueService.recallPatient(appointmentId);
      if (res.status) {
        toast.success(res.message);
        fetchQueue(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi gọi lại bệnh nhân');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (item: DoctorQueueItemDTO) => {
    switch (item.status) {
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5"><Stethoscope className="w-3 h-3" />Đang khám</span>;
      case 'MISSED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5"><UserX className="w-3 h-3" />Vắng mặt</span>;
      default:
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5"><Clock className="w-3 h-3" />Chờ khám</span>;
    }
  };

  // Kiểm tra có BN nào đang IN_PROGRESS không
  const hasInProgress = queueData?.queueList.some(item => item.status === 'IN_PROGRESS') || false;

  // Tìm bệnh nhân đầu tiên trong danh sách có trạng thái CONFIRMED hoặc WAITING để ưu tiên khám
  const firstEligiblePatient = queueData?.queueList.find(
    item => item.status === 'CONFIRMED' || item.status === 'WAITING'
  );

  // === KHÔNG CÓ SCHEDULE HÔM NAY ===
  if (!loading && schedules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDays className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Không có ca khám hôm nay</h2>
          <p className="text-gray-500">Bạn chưa có lịch khám nào được sắp xếp cho ngày hôm nay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Hàng đợi khám bệnh
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý thứ tự khám bệnh nhân trong ngày.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Chọn ca khám */}
          {schedules.length > 1 && (
            <select
              value={selectedScheduleId || ''}
              onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-bold text-gray-700 focus:ring-2 focus:ring-primary/20"
            >
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.room} | {s.startTime} - {s.endTime}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => fetchQueue(false)}
            className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all"
            title="Làm mới"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thống kê */}
      {queueData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tổng bệnh nhân</p>
            <p className="text-3xl font-black text-gray-800">{queueData.totalPatients}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Đã khám</p>
            <p className="text-3xl font-black text-emerald-600">{queueData.completedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Đang chờ</p>
            <p className="text-3xl font-black text-blue-600">{queueData.waitingCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Phòng</p>
            <p className="text-xl font-black text-gray-800 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> {queueData.room}
            </p>
          </div>
        </div>
      )}

      {/* Danh sách hàng đợi */}
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : !queueData || queueData.queueList.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Hàng đợi trống</h3>
          <p className="text-gray-500">Tất cả bệnh nhân đã được khám hoặc chưa có ai đăng ký ca này.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Danh sách ({queueData.queueList.length} bệnh nhân)</h3>
            {lastUpdated && (
              <span className="text-xs text-gray-400 font-medium">
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">STT</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {queueData.queueList.map((item) => {
                const isFirstEligible = item.appointmentId === firstEligiblePatient?.appointmentId;
                return (
                  <tr
                    key={item.appointmentId}
                    className={`transition-colors ${
                      item.status === 'IN_PROGRESS' ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {/* STT */}
                    <td className="px-8 py-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                        item.status === 'IN_PROGRESS'
                          ? 'bg-emerald-500 text-white'
                          : item.status === 'MISSED'
                            ? 'bg-red-100 text-red-500'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        {item.queueOrder !== undefined ? String(item.queueOrder).padStart(2, '0') : item.queuePosition}
                      </div>
                    </td>

                    {/* Tên BN */}
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900">{item.patientName}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Vị trí hàng chờ: {item.queuePosition}</p>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-8 py-5 text-center">
                      {getStatusBadge(item)}
                    </td>

                    {/* Nút hành động */}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nút "Bắt đầu khám" — chỉ hiện cho bệnh nhân ĐẦU HÀNG ĐỢI chờ khám và không ai đang khám */}
                        {isFirstEligible && !hasInProgress && (
                          <button
                            onClick={() => handleStart(item.appointmentId)}
                            disabled={actionLoading === item.appointmentId}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === item.appointmentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            Bắt đầu khám
                          </button>
                        )}

                        {/* Nút "Vắng mặt" — chỉ hiện cho bệnh nhân ĐẦU HÀNG ĐỢI chờ khám */}
                        {isFirstEligible && (
                          <button
                            onClick={() => handleAbsent(item.appointmentId)}
                            disabled={actionLoading === item.appointmentId}
                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === item.appointmentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                            Vắng mặt
                          </button>
                        )}

                        {/* Nút "Gọi lại" — chỉ hiện khi BN ở MISSED */}
                        {item.status === 'MISSED' && (
                          <button
                            onClick={() => handleRecall(item.appointmentId)}
                            disabled={actionLoading === item.appointmentId}
                            className="flex items-center gap-1.5 px-4 py-2 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === item.appointmentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
                            Gọi lại
                          </button>
                        )}

                        {/* Nút "Đang khám" — hiện thông tin khi BN ở IN_PROGRESS */}
                        {item.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => navigate(`/doctor/examination/${item.appointmentId}`)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            Vào phòng khám
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ghi chú */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-bold mb-1">Hướng dẫn</p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>Nhấn <strong>"Bắt đầu khám"</strong> để gọi bệnh nhân vào phòng (chỉ khám 1 người tại 1 thời điểm).</li>
            <li>Nhấn <strong>"Vắng mặt"</strong> nếu bệnh nhân không có mặt — họ sẽ được đưa xuống cuối danh sách.</li>
            <li>Nhấn <strong>"Gọi lại"</strong> để đưa bệnh nhân vắng mặt trở lại hàng đợi (sau 2 người).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

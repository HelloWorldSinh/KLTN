import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  MapPin,
  User,
  Loader2,
  RefreshCw,
  CalendarPlus,
  Stethoscope,
  AlertCircle,
  Timer
} from 'lucide-react';
import { queueService, type PatientQueueResponse, type QueueItemDTO } from '../services/queue.service';
import toast from 'react-hot-toast';
import { useSSE } from '../hooks/useSSE';
import { useAuthStore } from '../store/authStore';

export const PatientQueue = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState<PatientQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQueue = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await queueService.getPatientQueue();
      setData(res);
      setLastUpdated(new Date());
    } catch {
      toast.error('Không thể tải thông tin hàng đợi');
    } finally {
      setLoading(false);
    }
  };

  // Kết nối SSE thời gian thực để cập nhật hàng đợi
  const scheduleId = data?.scheduleId;
  useSSE({
    url: token && scheduleId ? `http://localhost:1111/sse/connect?token=${token}&scheduleId=${scheduleId}` : '',
    enabled: !!(token && scheduleId),
    eventListeners: {
      queue_update: () => {
        console.log('[SSE] Nhận sự kiện cập nhật hàng đợi. Đang tải dữ liệu mới...');
        fetchQueue(false);
      }
    }
  }, [token, scheduleId]);

  useEffect(() => {
    fetchQueue(true);
  }, []);

  // === TRẠNG THÁI: Đang tải ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-500 font-medium animate-pulse">Đang kiểm tra hàng đợi...</p>
      </div>
    );
  }

  // === TRẠNG THÁI: Không có lịch hẹn hôm nay (Luồng A1) ===
  if (!data || !data.hasAppointmentToday) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarPlus className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-3">
            Bạn không có lịch hẹn hôm nay
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Hiện tại bạn chưa có lịch khám nào trong ngày hôm nay. Hãy đặt lịch khám để được theo dõi thứ tự.
          </p>
          <Link
            to="/patient/book"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-95"
          >
            <CalendarPlus className="w-5 h-5" />
            Đăng ký lịch khám ngay
          </Link>
        </div>
      </div>
    );
  }

  // === TRẠNG THÁI: Có lịch hẹn → hiển thị hàng đợi ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-emerald-500';
      case 'MISSED': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  const getMyStatusStyle = () => {
    switch (data.myStatus) {
      case 'IN_PROGRESS':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <Stethoscope className="w-8 h-8 text-emerald-500" /> };
      case 'WAITING':
        if (data.myPosition === 1 || data.myDisplayStatus === 'Chuẩn bị') {
          return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Timer className="w-8 h-8 text-amber-500" /> };
        }
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Clock className="w-8 h-8 text-blue-500" /> };
      case 'CONFIRMED':
        if (data.myDisplayStatus === 'Chuẩn bị') {
          return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Timer className="w-8 h-8 text-amber-500" /> };
        }
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Clock className="w-8 h-8 text-blue-500" /> };
      case 'MISSED':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertCircle className="w-8 h-8 text-red-500" /> };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: <Clock className="w-8 h-8 text-gray-400" /> };
    }
  };

  const style = getMyStatusStyle();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            Hàng đợi khám bệnh
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi lượt khám của bạn trong ngày hôm nay.</p>
        </div>
        <button
          onClick={() => fetchQueue(false)}
          className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all hover:shadow-sm"
          title="Làm mới"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Thẻ trạng thái chính */}
      <div className={`${style.bg} ${style.border} border-2 rounded-3xl p-8 shadow-sm`}>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {style.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Trạng thái của bạn</p>
            <h2 className={`text-3xl font-black ${style.text}`}>
              {data.myDisplayStatus}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Vị trí</p>
            <div className={`text-5xl font-black ${style.text}`}>
              {data.myPosition}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">/ {data.totalInQueue} người</p>
          </div>
        </div>
      </div>

      {/* Thông tin ca khám */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin lịch khám</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">Bác sĩ</p>
              <p className="font-bold text-gray-800">BS. {data.doctorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">Phòng khám</p>
              <p className="font-bold text-gray-800">{data.room}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold">Khung giờ</p>
              <p className="font-bold text-gray-800">{data.startTime} - {data.endTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách hàng đợi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Danh sách hàng đợi
          </h3>
          {lastUpdated && (
            <span className="text-xs text-gray-400 font-medium">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {data.queueList.map((item: QueueItemDTO) => {
            const isMe = item.appointmentId === data.appointmentId;
            return (
              <div
                key={item.appointmentId}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${isMe ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50'}`}
              >
                {/* Số thứ tự */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                  item.status === 'IN_PROGRESS'
                    ? 'bg-emerald-500 text-white'
                    : isMe
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.queuePosition}
                </div>

                {/* Nhãn */}
                <div className="flex-1">
                  <p className={`font-bold ${isMe ? 'text-primary' : 'text-gray-700'}`}>
                    Số thứ tự {item.queuePosition}
                    {isMe && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Bạn</span>}
                  </p>
                </div>

                {/* Trạng thái */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
                  <span className={`text-sm font-bold ${
                    item.status === 'IN_PROGRESS' ? 'text-emerald-600'
                      : item.status === 'MISSED' ? 'text-red-500'
                        : item.displayStatus === 'Chuẩn bị' ? 'text-amber-600'
                          : 'text-gray-500'
                  }`}>
                    {item.displayStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ghi chú */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Lưu ý</p>
          <p>Danh sách tự động cập nhật tức thời khi có thay đổi. Vui lòng có mặt tại phòng khám khi đến lượt của bạn để tránh bị đánh dấu vắng mặt.</p>
        </div>
      </div>
    </div>
  );
};

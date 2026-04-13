import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Users
} from 'lucide-react';
import { scheduleService, type ScheduleDTO, type ScheduleCreateRequest } from '../services/schedule.service';
import { adminService, type AccountResponse } from '../services/admin.service';
import { Modal } from '../components/Modal';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ Nhật' },
];

export const ScheduleManagement = () => {
  const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();

  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [doctors, setDoctors] = useState<AccountResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDTO | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: 0,
    workDate: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    startTime: '07:30',
    endTime: '17:00',
    slot: 10,
    room: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduleData, userData] = await Promise.all([
        scheduleService.getAllSchedules(),
        adminService.getAllAccounts()
      ]);
      setSchedules(scheduleData);
      setDoctors(userData.filter(u => u.role === 'DOCTOR'));
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDelete = async (id: number, appointmentCount: number) => {
    if (appointmentCount > 0) {
      alert('Không thể xóa lịch đã có bệnh nhân đăng ký!');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) {
      try {
        const response = await scheduleService.deleteSchedule(id);
        if (response.status) {
          setSuccess('Đã xóa lịch thành công');
          setSchedules(schedules.filter(s => s.id !== id));
        } else {
          alert('Lỗi: ' + response.message);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi thực hiện yêu cầu.');
      }
    }
  };

  const handleOpenModal = (schedule: ScheduleDTO | null = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setIsRecurring(false);
      setFormData({
        doctorId: schedule.doctorId,
        workDate: schedule.workDate,
        startDate: schedule.workDate,
        endDate: '',
        daysOfWeek: [],
        startTime: schedule.startTime.substring(0, 5),
        endTime: schedule.endTime.substring(0, 5),
        slot: schedule.slot,
        room: schedule.room,
      });
    } else {
      setEditingSchedule(null);
      setIsRecurring(false);
      setFormData({
        doctorId: 0,
        workDate: '',
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        startTime: '07:30',
        endTime: '17:00',
        slot: 10,
        room: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSchedule) {
        const response = await scheduleService.updateSchedule(editingSchedule.id!, {
          doctorId: formData.doctorId,
          workDate: formData.workDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          slot: formData.slot,
          room: formData.room,
        });
        if (response.status) {
          setSuccess('Cập nhật lịch thành công');
        } else {
          throw new Error(response.message);
        }
      } else {
        const request: ScheduleCreateRequest = {
          doctorId: formData.doctorId,
          startDate: isRecurring ? formData.startDate : formData.workDate,
          endDate: isRecurring ? formData.endDate : undefined,
          daysOfWeek: isRecurring ? formData.daysOfWeek : undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          slot: formData.slot,
          room: formData.room,
          recurring: isRecurring,
        };
        const response = await scheduleService.createSchedules(request);
        if (response.status) {
          setSuccess(response.message);
        } else {
          throw new Error(response.message);
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const filteredSchedules = schedules.filter(s => {
    const matchSearch = s.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.room.toLowerCase().includes(searchTerm.toLowerCase());

    const workDate = s.workDate;
    const matchDate = (!startDate || workDate >= startDate) && (!endDate || workDate <= endDate);

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary h-8 w-8" />
            Quản lý Lịch làm việc
          </h1>
          <p className="text-gray-500 mt-1">Thiết lập và điều phối lịch khám cho đội ngũ bác sĩ</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Tạo lịch làm việc</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-500 h-5 w-5" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm tên bác sĩ hoặc phòng khám..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Từ</span>
                <input
                  type="date"
                  className="px-2 py-2 bg-transparent focus:outline-none text-sm text-gray-600"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate(e.target.value);
                    }
                  }}
                  title="Từ ngày"
                />
              </div>
              <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Đến</span>
                <input
                  type="date"
                  className="px-2 py-2 bg-transparent focus:outline-none text-sm text-gray-600"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="Đến ngày"
                />
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors self-end md:self-center"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới dữ liệu
          </button>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
            <div className="bg-red-50 p-4 rounded-full text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <p className="text-red-600 max-w-xs">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Bác sĩ</th>
                  <th className="px-6 py-4">Ngày khám</th>
                  <th className="px-6 py-4">Khung giờ</th>
                  <th className="px-6 py-4">Phòng / Số lượng</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchedules.map((s) => (
                  <tr key={s.id} className="group hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-700 block group-hover:text-primary transition-colors">
                            {s.doctorName}
                          </span>
                          <span className="text-xs text-gray-400">ID: #{s.doctorId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {new Date(s.workDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                          {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium">Phòng: {s.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span className="text-xs text-gray-500">
                            Đã đặt: <b className="text-gray-700">{s.appointmentCount}</b> / {s.slot}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(s)}
                          disabled={(s.appointmentCount || 0) > 0}
                          className={`p-2 rounded-lg border transition-all shadow-sm ${(s.appointmentCount || 0) > 0
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-white border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5'
                            }`}
                          title={(s.appointmentCount || 0) > 0 ? "Không thể sửa lịch đã có bệnh nhân" : "Chỉnh sửa"}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id!, s.appointmentCount || 0)}
                          disabled={(s.appointmentCount || 0) > 0}
                          className={`p-2 rounded-lg border transition-all shadow-sm ${(s.appointmentCount || 0) > 0
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-white border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                            }`}
                          title={(s.appointmentCount || 0) > 0 ? "Không thể xóa lịch đã có bệnh nhân" : "Xóa"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Cập nhật lịch khám' : 'Thiết lập lịch làm việc mới'}
        icon={Calendar}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bác sĩ phụ trách</label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: Number(e.target.value) })}
                disabled={!!editingSchedule}
              >
                <option value="">Chọn bác sĩ...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>

            {!editingSchedule && (
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="recurring" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Lặp lại lịch chuyên môn (Recurring)
                </label>
              </div>
            )}

            {!isRecurring ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày làm việc</label>
                <input
                  type="date"
                  required
                  min={today}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={formData.workDate}
                  onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Từ ngày</label>
                    <input
                      type="date"
                      required
                      min={today}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          startDate: newStart,
                          endDate: prev.endDate && prev.endDate < newStart ? newStart : prev.endDate
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Đến ngày</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate || today}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Các ngày trong tuần</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${formData.daysOfWeek.includes(day.value)
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                          }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giờ bắt đầu</label>
                <input
                  type="time"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giờ kết thúc</label>
                <input
                  type="time"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phòng khám</label>
                <input
                  type="text"
                  required
                  placeholder="H01, Lầu 2..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng tối đa</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={formData.slot}
                  onChange={(e) => setFormData({ ...formData, slot: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{editingSchedule ? 'Lưu thay đổi' : 'Xác nhận tạo'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

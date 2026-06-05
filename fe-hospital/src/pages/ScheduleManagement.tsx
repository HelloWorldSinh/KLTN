import React, { useState, useEffect, useRef } from 'react';
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
  const [doctorInputText, setDoctorInputText] = useState('');
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const doctorSelectRef = useRef<HTMLDivElement>(null);

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
    startTime: '07:00',
    endTime: '11:00',
    slot: 10,
    room: '',
    shiftType: 'ALL_DAY',
  });

  const [submitting, setSubmitting] = useState(false);

  // Admin approval/rejection tab states
  const [activeTab, setActiveTab] = useState<'list' | 'cancellations'>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('tab') === 'cancellations' ? 'cancellations' : 'list') as 'list' | 'cancellations';
  });
  const [rejectingSchedule, setRejectingSchedule] = useState<ScheduleDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState<number | null>(null);

  const handleApproveCancel = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu hủy lịch trực này? Toàn bộ lịch hẹn của bệnh nhân trong ca trực này sẽ bị hủy tự động và bệnh nhân sẽ nhận được thông báo.')) {
      return;
    }
    setProcessingAction(id);
    try {
      const res = await scheduleService.approveCancelSchedule(id);
      if (res.status) {
        setSuccess('Đã phê duyệt hủy lịch trực thành công');
        fetchData();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi yêu cầu phê duyệt.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleOpenRejectModal = (schedule: ScheduleDTO) => {
    setRejectingSchedule(schedule);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSchedule || !rejectingSchedule.id) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await scheduleService.rejectCancelSchedule(rejectingSchedule.id, rejectReason);
      if (res.status) {
        setSuccess('Đã từ chối yêu cầu hủy lịch trực');
        setIsRejectModalOpen(false);
        setRejectingSchedule(null);
        setRejectReason('');
        fetchData();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi thực hiện từ chối.');
    } finally {
      setSubmitting(false);
    }
  };

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
    const handleClickOutside = (event: MouseEvent) => {
      if (doctorSelectRef.current && !doctorSelectRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
        if (formData.doctorId === 0) {
          setDoctorInputText('');
        } else {
          const doc = doctors.find(d => d.id === formData.doctorId);
          if (doc) setDoctorInputText(doc.fullName);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formData.doctorId, doctors]);

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

  const handleShiftTypeChange = (type: string) => {
    let start = formData.startTime;
    let end = formData.endTime;
    if (type === 'MORNING') {
      start = '07:00';
      end = '11:00';
    } else if (type === 'AFTERNOON') {
      start = '13:00';
      end = '17:00';
    }
    setFormData(prev => ({
      ...prev,
      shiftType: type,
      startTime: start,
      endTime: end
    }));
  };

  const handleOpenModal = (schedule: ScheduleDTO | null = null) => {
    setIsDoctorDropdownOpen(false);
    if (schedule) {
      setEditingSchedule(schedule);
      setIsRecurring(false);

      let determinedShift = 'MORNING';
      let start = '07:00';
      let end = '11:00';
      const schedStart = schedule.startTime.substring(0, 5);
      if (schedStart >= '12:00') {
        determinedShift = 'AFTERNOON';
        start = '13:00';
        end = '17:00';
      }

      setFormData({
        doctorId: schedule.doctorId,
        workDate: schedule.workDate,
        startDate: schedule.workDate,
        endDate: '',
        daysOfWeek: [],
        startTime: start,
        endTime: end,
        slot: schedule.slot,
        room: schedule.room,
        shiftType: determinedShift,
      });
      setDoctorInputText(schedule.doctorName || '');
    } else {
      setEditingSchedule(null);
      setIsRecurring(false);
      setFormData({
        doctorId: 0,
        workDate: '',
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        startTime: '07:00',
        endTime: '11:00',
        slot: 10,
        room: '',
        shiftType: 'ALL_DAY',
      });
      setDoctorInputText('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.doctorId === 0) {
      alert('Vui lòng chọn một bác sĩ từ danh sách gợi ý.');
      return;
    }
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
        const requestTemplate = {
          doctorId: formData.doctorId,
          startDate: isRecurring ? formData.startDate : formData.workDate,
          endDate: isRecurring ? formData.endDate : undefined,
          daysOfWeek: isRecurring ? formData.daysOfWeek : undefined,
          slot: formData.slot,
          room: formData.room,
          recurring: isRecurring,
        };

        if (formData.shiftType === 'ALL_DAY') {
          // Tạo lịch ca sáng
          const reqMorning: ScheduleCreateRequest = {
            ...requestTemplate,
            startTime: '07:00',
            endTime: '11:00',
          };
          // Tạo lịch ca chiều
          const reqAfternoon: ScheduleCreateRequest = {
            ...requestTemplate,
            startTime: '13:00',
            endTime: '17:00',
          };

          const [resMorning, resAfternoon] = await Promise.all([
            scheduleService.createSchedules(reqMorning),
            scheduleService.createSchedules(reqAfternoon)
          ]);

          if (resMorning.status && resAfternoon.status) {
            setSuccess('Đã tạo lịch làm việc cả ngày (ca sáng & ca chiều) thành công');
          } else if (!resMorning.status) {
            throw new Error(`Ca sáng thất bại: ${resMorning.message}`);
          } else {
            throw new Error(`Ca chiều thất bại: ${resAfternoon.message}`);
          }
        } else {
          const request: ScheduleCreateRequest = {
            ...requestTemplate,
            startTime: formData.startTime,
            endTime: formData.endTime,
          };
          const response = await scheduleService.createSchedules(request);
          if (response.status) {
            setSuccess(response.message);
          } else {
            throw new Error(response.message);
          }
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

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-150 gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`py-3 px-6 font-bold border-b-2 transition-all text-sm flex items-center gap-2 -mb-[2px] cursor-pointer ${
            activeTab === 'list'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Danh sách lịch làm việc
        </button>
        <button
          onClick={() => setActiveTab('cancellations')}
          className={`py-3 px-6 font-bold border-b-2 transition-all text-sm flex items-center gap-2 -mb-[2px] cursor-pointer ${
            activeTab === 'cancellations'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Yêu cầu hủy lịch trực
          {schedules.filter(s => s.status === 'PENDING_CANCEL').length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {schedules.filter(s => s.status === 'PENDING_CANCEL').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'list' ? (
        /* Search & Filter & List Table */
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
      ) : (
        /* Cancellation Request List Tab */
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách chờ duyệt...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <th className="px-6 py-4">Bác sĩ</th>
                    <th className="px-6 py-4">Lịch trực</th>
                    <th className="px-6 py-4">Lý do hủy của Bác sĩ</th>
                    <th className="px-6 py-4 text-right">Quyết định xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedules.filter(s => s.status === 'PENDING_CANCEL').map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold">
                            {s.doctorName?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-700 block">{s.doctorName}</span>
                            <span className="text-xs text-gray-400">ID: #{s.doctorId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-700">
                            {new Date(s.workDate).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-xs font-semibold text-gray-500">
                            {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)} | Phòng: {s.room}
                          </div>
                          <div className="text-xs text-gray-400">
                            Số lịch hẹn bị ảnh hưởng: <b className="text-red-500 font-black">{s.appointmentCount || 0}</b>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-650 font-semibold italic max-w-md">
                          "{s.cancelReason || 'Không cung cấp lý do'}"
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleApproveCancel(s.id!)}
                            disabled={processingAction !== null}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-emerald-600/10"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(s)}
                            disabled={processingAction !== null}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-red-650/10"
                          >
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {schedules.filter(s => s.status === 'PENDING_CANCEL').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Không có yêu cầu hủy lịch trực nào đang chờ duyệt.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Cập nhật lịch khám' : 'Thiết lập lịch làm việc mới'}
        icon={Calendar}
      >
        {/* ... form content ... */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div ref={doctorSelectRef} className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Bác sĩ phụ trách</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  placeholder="Tìm và chọn bác sĩ..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm bg-white"
                  value={doctorInputText}
                  onChange={(e) => {
                    setDoctorInputText(e.target.value);
                    setIsDoctorDropdownOpen(true);
                    setFormData(prev => ({ ...prev, doctorId: 0 }));
                  }}
                  onFocus={() => {
                    if (!editingSchedule) setIsDoctorDropdownOpen(true);
                  }}
                  disabled={!!editingSchedule}
                />
              </div>

              {isDoctorDropdownOpen && !editingSchedule && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in duration-100">
                  {doctors.filter((d) => d.fullName.toLowerCase().includes(doctorInputText.toLowerCase())).length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy bác sĩ</div>
                  ) : (
                    doctors
                      .filter((d) => d.fullName.toLowerCase().includes(doctorInputText.toLowerCase()))
                      .map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, doctorId: d.id }));
                            setDoctorInputText(d.fullName);
                            setIsDoctorDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 hover:text-primary transition-colors border-b border-gray-50 last:border-0 font-medium cursor-pointer"
                        >
                          {d.fullName}
                        </button>
                      ))
                  )}
                </div>
              )}
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Khung giờ làm việc</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'MORNING', label: 'Ca Sáng', time: '07:00 - 11:00' },
                  { value: 'AFTERNOON', label: 'Ca Chiều', time: '13:00 - 17:00' },
                  ...(!editingSchedule ? [{ value: 'ALL_DAY', label: 'Cả ngày', time: 'Sáng & Chiều' }] : []),
                ].map((shift) => (
                  <button
                    key={shift.value}
                    type="button"
                    onClick={() => handleShiftTypeChange(shift.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${formData.shiftType === shift.value
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-bold text-sm">{shift.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{shift.time}</span>
                  </button>
                ))}
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

      {/* Reject Cancellation Request Modal */}
      {isRejectModalOpen && rejectingSchedule && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectingSchedule(null);
            setRejectReason('');
          }}
          title="Từ chối yêu cầu hủy lịch trực"
          icon={AlertCircle}
          maxWidth="sm"
        >
          <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-sm text-slate-650">
              <div>
                <span className="font-bold text-gray-400 block uppercase text-[10px]">Bác sĩ</span>
                <span className="font-black text-slate-800">{rejectingSchedule.doctorName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-gray-400 block uppercase text-[10px]">Lịch trực</span>
                  <span className="font-bold text-slate-700">{rejectingSchedule.workDate}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase text-[10px]">Ca trực</span>
                  <span className="font-bold text-slate-700">
                    {rejectingSchedule.startTime.substring(0, 5)} - {rejectingSchedule.endTime.substring(0, 5)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-650 uppercase tracking-wider">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối duyệt yêu cầu..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all min-h-[100px] text-sm text-slate-700 bg-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectingSchedule(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-650 text-white rounded-lg text-sm font-semibold transition shadow-md active:scale-95 cursor-pointer"
              >
                {submitting ? 'Đang từ chối...' : 'Từ chối yêu cầu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

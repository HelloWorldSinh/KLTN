import { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar as CalendarIcon, Clock, User, CheckCircle, Loader2, ArrowLeft, MapPin,
  Search, Filter, X, Eye, BookOpen, GraduationCap, Phone, Mail, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { doctorService, type DoctorResponse } from '../services/doctor.service';
import { scheduleService } from '../services/schedule.service';
import type { ScheduleDTO } from '../services/schedule.service';
import { appointmentService } from '../services/appointment.service';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';

export const PatientBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { preselectedSpecialtyId?: number; preselectedDoctorId?: number } | null;

  const [step, setStep] = useState(1);

  // Doctors & Specialties Data
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Booking Target
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<ScheduleDTO[]>([]);
  
  // Step 2 Calendar & Shift Selection States
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDTO | null>(null);

  // Doctor Detail Modal State (inside Step 1)
  const [detailsDoctor, setDetailsDoctor] = useState<DoctorResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Step 4 Booking Success States
  const [bookedOrder, setBookedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [doctorsData, specialtiesData] = await Promise.all([
        doctorService.getAllDoctors(),
        specialtyService.getAllSpecialties()
      ]);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);

      // Handle preselection if passed via router state
      if (state?.preselectedDoctorId) {
        const foundDoc = doctorsData.find(d => d.id === state.preselectedDoctorId);
        if (foundDoc) {
          handleSelectDoctor(foundDoc);
        }
      } else if (state?.preselectedSpecialtyId) {
        setSelectedSpecialtyId(state.preselectedSpecialtyId);
      }
    } catch (err) {
      toast.error('Lỗi tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setFetchingSchedules(true);
    setSelectedDate('');
    setSelectedSchedule(null);
    try {
      const data = await scheduleService.getAvailableSchedules({ doctorId: doctor.id });
      setDoctorSchedules(data);
      if (data.length > 0) {
        // Group by dates & sort
        const dates = [...new Set(data.map(s => s.workDate))].sort();
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
          const d = new Date(dates[0]);
          setCurrentMonth(d.getMonth());
          setCurrentYear(d.getFullYear());
        }
      }
    } catch (err) {
      toast.error('Lỗi lấy lịch khám của bác sĩ');
    } finally {
      setFetchingSchedules(false);
    }
  };

  const getExperienceYears = (startDateStr?: string) => {
    if (!startDateStr) return 0;
    try {
      const startYear = new Date(startDateStr).getFullYear();
      const currentYear = new Date().getFullYear();
      return Math.max(0, currentYear - startYear);
    } catch (e) {
      return 0;
    }
  };

  const handleOpenDetails = (doctor: DoctorResponse) => {
    setDetailsDoctor(doctor);
    setIsDetailsModalOpen(true);
  };

  // Step 1 Doctor Filtering Logic
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.degree && doc.degree.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.specialtyName && doc.specialtyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = selectedSpecialtyId === null || doc.specialtyId === selectedSpecialtyId;

    return matchesSearch && matchesSpecialty;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialtyId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  // Step 2 Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const adjustedStartDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const days: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];
    
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({ dayNumber: 0, dateString: '', isCurrentMonth: false });
    }
    
    for (let d = 1; d <= numDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateString, isCurrentMonth: true });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Filter schedules for the selected day in Step 2
  const daySchedules = doctorSchedules.filter(s => s.workDate === selectedDate);
  const morningSchedule = daySchedules.find(s => s.startTime.localeCompare("12:00:00") < 0);
  const afternoonSchedule = daySchedules.find(s => s.startTime.localeCompare("12:00:00") >= 0);

  const handleConfirm = async () => {
    if (!selectedSchedule) return;
    setSubmitting(true);
    try {
      const res = await appointmentService.bookAppointment({ scheduleId: selectedSchedule.id! });
      if (res.status) {
        setBookedOrder(res.data);
        setStep(4);
        toast.success('Đặt lịch thành công!');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {step <= 3 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="text-primary h-8 w-8" />
              Đặt lịch khám bệnh
            </h1>
            <p className="text-gray-500 mt-1">Tìm kiếm bác sĩ, chọn lịch khám và đăng ký nhanh chóng.</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      {step <= 3 && (
        <div className="flex items-center justify-between px-4 sm:px-12 relative max-w-3xl mx-auto">
          <div className="absolute left-10 right-10 top-1/2 h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
          {[
            { num: 1, label: 'Chọn Bác sĩ' },
            { num: 2, label: 'Chọn Ngày & Giờ' },
            { num: 3, label: 'Xác nhận' }
          ].map((i) => (
            <div key={i.num} className="flex flex-col items-center gap-2 bg-gray-50/80 p-2 rounded-xl">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-md ${step >= i.num ? 'bg-primary text-white scale-110 shadow-primary/30' : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                {step > i.num ? <CheckCircle className="w-6 h-6" /> : i.num}
              </div>
              <span className={`text-sm font-bold ${step >= i.num ? 'text-primary' : 'text-gray-400'}`}>{i.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Doctor Search & Specialty Filter */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filters Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Search Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Tìm kiếm bác sĩ
              </h3>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tên bác sĩ, học vị..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Lọc chuyên khoa
                </h3>
                {selectedSpecialtyId !== null && (
                  <button
                    onClick={() => setSelectedSpecialtyId(null)}
                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedSpecialtyId(null)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedSpecialtyId === null
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả chuyên khoa
                </button>
                {specialties.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialtyId(spec.id!)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedSpecialtyId === spec.id
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Doctors Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-slate-500">
                Tìm thấy <span className="text-primary text-base font-black">{filteredDoctors.length}</span> bác sĩ
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-20 shadow-sm flex flex-col items-center justify-center gap-4">
                <Clock className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-semibold animate-pulse">Đang tải danh sách bác sĩ...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-20 shadow-sm text-center text-slate-400 space-y-3">
                <User className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-500">Không tìm thấy bác sĩ nào phù hợp.</p>
                <p className="text-xs text-slate-400">Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc chuyên khoa.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  {currentDoctors.map((doctor) => {
                    const experience = getExperienceYears(doctor.startWorkingDate);
                    return (
                      <div
                        key={doctor.id}
                        className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        {/* Hover accent bar on the left */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                        {/* Doctor info container */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 min-w-0">
                          {/* Avatar Initials */}
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-50 flex items-center justify-center text-primary border border-primary/15 font-black text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {doctor.fullName.charAt(0).toUpperCase()}
                          </div>
                          
                          {/* Text info */}
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors leading-snug truncate">
                                BS. {doctor.fullName}
                              </h4>
                              {doctor.degree && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {doctor.degree}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-700">{doctor.specialtyName || 'Chưa phân khoa'}</span>
                              </div>
                              {experience > 0 && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{experience} năm kinh nghiệm</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-4 md:pt-0 border-t border-slate-50 md:border-none w-full md:w-auto shrink-0 md:justify-end">
                          <button
                            onClick={() => handleOpenDetails(doctor)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 hover:border-primary hover:text-primary rounded-xl text-xs font-bold text-slate-600 bg-white transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleSelectDoctor(doctor)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 cursor-pointer whitespace-nowrap"
                          >
                            <CalendarIcon className="w-4 h-4" />
                            Đặt lịch
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>


                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 bg-white text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-primary text-white shadow-md shadow-primary/15'
                            : 'bg-white text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 bg-white text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Interactive Calendar Month & Shift Selection */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại tìm bác sĩ
          </button>

          <div className="flex items-center gap-3 px-2">
            <CalendarIcon className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chọn lịch khám của BS. {selectedDoctor.fullName}
            </h2>
          </div>

          {fetchingSchedules ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              
              {/* Left Column: Calendar Grid */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Tháng {currentMonth + 1}, {currentYear}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors"
                      title="Tháng trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors"
                      title="Tháng sau"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Days of Week Header */}
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 py-2 uppercase tracking-wide">
                      {day}
                    </div>
                  ))}

                  {/* Days Matrix */}
                  {calendarDays.map((day, idx) => {
                    if (day.dayNumber === 0) {
                      return <div key={`empty-${idx}`} />;
                    }

                    // Check if doctor has schedule on this date
                    const isWorking = doctorSchedules.some(s => s.workDate === day.dateString);
                    const isSelected = selectedDate === day.dateString;

                    return (
                      <button
                        key={day.dateString}
                        disabled={!isWorking}
                        onClick={() => {
                          setSelectedDate(day.dateString);
                          setSelectedSchedule(null);
                        }}
                        className={`h-12 w-full rounded-xl flex items-center justify-center text-sm transition-all duration-150 ${
                          isWorking
                            ? isSelected
                              ? 'bg-primary-dark text-white font-extrabold ring-4 ring-primary-light/50 scale-105 shadow-md border border-primary-light'
                              : 'bg-primary text-white font-bold hover:bg-primary-dark cursor-pointer shadow-sm hover:scale-[1.03]'
                            : 'bg-slate-50/60 text-slate-300 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-4 items-center pt-2 px-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-primary rounded-md" />
                    <span className="text-slate-500 font-semibold">Bác sĩ làm việc (Xanh đậm)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-slate-50 border border-slate-100 rounded-md" />
                    <span className="text-slate-400 font-medium">Bác sĩ nghỉ</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Shift Buttons */}
              <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Ca khám có sẵn
                  </h3>
                  
                  {!selectedDate ? (
                    <p className="text-sm text-slate-400 italic">Vui lòng chọn một ngày bác sĩ làm việc trên lịch.</p>
                  ) : daySchedules.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Không có ca khám nào vào ngày này.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Morning Shift */}
                      {morningSchedule ? (
                        (() => {
                          const slotsLeft = morningSchedule.slot - (morningSchedule.appointmentCount || 0);
                          const hasSlots = slotsLeft > 0;
                          const isSelected = selectedSchedule?.id === morningSchedule.id;

                          return (
                            <button
                              disabled={!hasSlots}
                              onClick={() => setSelectedSchedule(morningSchedule)}
                              className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left shadow-sm ${
                                hasSlots
                                  ? isSelected
                                    ? 'bg-teal-100/65 border-primary text-primary-dark font-extrabold ring-2 ring-primary/20 hover:bg-teal-100'
                                    : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300 cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="font-bold text-sm block">Ca Sáng</span>
                                <span className="text-xs opacity-80 font-medium">
                                  {morningSchedule.startTime.substring(0, 5)} - {morningSchedule.endTime.substring(0, 5)}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                hasSlots
                                  ? 'bg-teal-100/50 border-teal-200 text-teal-700'
                                  : 'bg-slate-200 border-slate-350 text-slate-500'
                              }`}>
                                {hasSlots ? `Còn ${slotsLeft} chỗ` : 'Hết chỗ'}
                              </span>
                            </button>
                          );
                        })()
                      ) : (
                        <div className="p-4 border border-dashed border-slate-100 rounded-2xl text-center text-xs text-slate-400 bg-slate-50/30">
                          Bác sĩ không khám ca sáng ngày này.
                        </div>
                      )}

                      {/* Afternoon Shift */}
                      {afternoonSchedule ? (
                        (() => {
                          const slotsLeft = afternoonSchedule.slot - (afternoonSchedule.appointmentCount || 0);
                          const hasSlots = slotsLeft > 0;
                          const isSelected = selectedSchedule?.id === afternoonSchedule.id;

                          return (
                            <button
                              disabled={!hasSlots}
                              onClick={() => setSelectedSchedule(afternoonSchedule)}
                              className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left shadow-sm ${
                                hasSlots
                                  ? isSelected
                                    ? 'bg-teal-100/65 border-primary text-primary-dark font-extrabold ring-2 ring-primary/20 hover:bg-teal-100'
                                    : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300 cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="font-bold text-sm block">Ca Chiều</span>
                                <span className="text-xs opacity-80 font-medium">
                                  {afternoonSchedule.startTime.substring(0, 5)} - {afternoonSchedule.endTime.substring(0, 5)}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                hasSlots
                                  ? 'bg-teal-100/50 border-teal-200 text-teal-700'
                                  : 'bg-slate-200 border-slate-350 text-slate-500'
                              }`}>
                                {hasSlots ? `Còn ${slotsLeft} chỗ` : 'Hết chỗ'}
                              </span>
                            </button>
                          );
                        })()
                      ) : (
                        <div className="p-4 border border-dashed border-slate-100 rounded-2xl text-center text-xs text-slate-400 bg-slate-50/30">
                          Bác sĩ không khám ca chiều ngày này.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <button
                    disabled={!selectedSchedule}
                    onClick={() => setStep(3)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-primary/10 hover:shadow-primary/25 cursor-pointer"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedSchedule && selectedDoctor && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Chọn giờ khác
          </button>

          <div className="flex items-center gap-2 px-2">
            <CheckCircle className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">Xác nhận Đặt Lịch</h2>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="bg-primary/5 border-b border-primary/10 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-sm font-black text-xl border border-primary/10">
                  {selectedDoctor.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">BS. {selectedDoctor.fullName}</h3>
                  <span className="inline-block px-3 py-1 bg-white rounded-full text-sm font-bold text-primary shadow-sm border border-primary/10">
                    {selectedDoctor.specialtyName || 'Chuyên khoa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <CalendarIcon className="w-6 h-6 text-indigo-500 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày khám</p>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(selectedSchedule.workDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <Clock className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Thời gian</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedSchedule.startTime.localeCompare("12:00:00") < 0 ? 'Ca Sáng: ' : 'Ca Chiều: '}
                      {selectedSchedule.startTime.substring(0, 5)} - {selectedSchedule.endTime.substring(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 md:col-span-2">
                  <MapPin className="w-6 h-6 text-emerald-500 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Phòng khám</p>
                    <p className="text-lg font-bold text-gray-800">{selectedSchedule.room}</p>
                    <p className="text-gray-500 text-sm mt-1">Vui lòng đến trước 15 phút để làm thủ tục.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] cursor-pointer"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success Screen */}
      {step === 4 && selectedSchedule && selectedDoctor && (
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Đặt Lịch Thành Công!</h2>
            <p className="text-gray-500 text-sm mt-1">Thông tin đặt lịch của bạn đã được ghi nhận.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-3">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Bác sĩ khám</span>
              <span className="font-extrabold text-gray-800">BS. {selectedDoctor.fullName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Ngày khám</span>
                <span className="font-bold text-gray-700 text-sm">
                  {new Date(selectedSchedule.workDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Thời gian</span>
                <span className="font-bold text-gray-700 text-sm">
                  {selectedSchedule.startTime.localeCompare("12:00:00") < 0 ? 'Ca Sáng: ' : 'Ca Chiều: '}
                  {selectedSchedule.startTime.substring(0, 5)} - {selectedSchedule.endTime.substring(0, 5)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Phòng khám</span>
              <span className="font-bold text-gray-700 text-sm">{selectedSchedule.room}</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest block mb-1">Số thứ tự của bạn</span>
            <span className="text-5xl font-black text-primary tracking-tight">{bookedOrder}</span>
            <p className="text-[11px] text-gray-400 mt-2">Vui lòng chụp ảnh màn hình hoặc xem trong mục Lịch của tôi để theo dõi hàng đợi khám.</p>
          </div>

          <button
            onClick={() => navigate('/patient/schedule')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] cursor-pointer"
          >
            Xem lịch hẹn của tôi
          </button>
        </div>
      )}

      {/* Doctor Details Modal (inside Step 1) */}
      {detailsDoctor && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Thông Tin Chi Tiết Bác Sĩ`}
          icon={BookOpen}
          maxWidth="3xl"
        >
          <div className="p-8 space-y-6">
            {/* Top Section Profile summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/10 to-indigo-50 border border-primary/20 flex items-center justify-center text-primary font-black text-3xl shadow-inner shadow-primary/5">
                {detailsDoctor.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="text-2xl font-black text-slate-800">BS. {detailsDoctor.fullName}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {detailsDoctor.specialtyName || 'Chưa phân khoa'}
                  </span>
                  {detailsDoctor.degree && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {detailsDoctor.degree}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Box */}
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Thông Tin Cá Nhân</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Giới tính: <span className="font-bold text-slate-700">{detailsDoctor.gender === 'MALE' ? 'Nam' : detailsDoctor.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span></span>
                  </div>
                  {detailsDoctor.dob && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Ngày sinh: <span className="font-bold text-slate-700">{new Date(detailsDoctor.dob).toLocaleDateString('vi-VN')}</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Experience Box */}
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Thông Tin Liên Hệ & Chuyên Môn</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Số điện thoại: <span className="font-bold text-slate-700">{detailsDoctor.phone}</span></span>
                  </div>
                  {detailsDoctor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">Email: <span className="font-bold text-slate-700">{detailsDoctor.email}</span></span>
                    </div>
                  )}
                  {detailsDoctor.startWorkingDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Thâm niên: <span className="font-bold text-slate-700">{getExperienceYears(detailsDoctor.startWorkingDate)} năm ({new Date(detailsDoctor.startWorkingDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })})</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => { 
                  setIsDetailsModalOpen(false); 
                  handleSelectDoctor(detailsDoctor); 
                }}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                Đặt lịch hẹn ngay
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar as CalendarIcon, Clock, User, CheckCircle, Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { scheduleService } from '../services/schedule.service';
import type { ScheduleDTO } from '../services/schedule.service';
import { appointmentService } from '../services/appointment.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PatientBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyDTO | null>(null);

  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDTO | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const data = await specialtyService.getAllSpecialties();
      setSpecialties(data);
    } catch (err) {
      toast.error('Không thể tải chuyên khoa. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpecialty = async (specialty: SpecialtyDTO) => {
    setSelectedSpecialty(specialty);
    setStep(2);
    setFetchingSchedules(true);
    try {
      const data = await scheduleService.getAvailableSchedules({ specialtyId: specialty.id });
      setSchedules(data);
      if (data.length > 0) {
        // Group by dates
        const dates = [...new Set(data.map(s => s.workDate))].sort();
        if (dates.length > 0) setSelectedDate(dates[0]);
      }
    } catch (err) {
      toast.error('Lỗi lấy lịch khám. Vui lòng thử lại.');
    } finally {
      setFetchingSchedules(false);
    }
  };

  const groupedByDoctor = schedules
    .filter(s => s.workDate === selectedDate)
    .reduce((acc, curr) => {
      if (!acc[curr.doctorId]) {
        acc[curr.doctorId] = {
          doctorName: curr.doctorName || '',
          schedules: []
        };
      }
      acc[curr.doctorId].schedules.push(curr);
      return acc;
    }, {} as Record<number, { doctorName: string, schedules: ScheduleDTO[] }>);

  const availableDates = [...new Set(schedules.map(s => s.workDate))].sort();

  const handleConfirm = async () => {
    if (!selectedSchedule) return;
    setSubmitting(true);
    try {
      const res = await appointmentService.bookAppointment({ scheduleId: selectedSchedule.id! });
      if (res.status) {
        toast.success('Đặt lịch thành công!');
        navigate('/patient/schedule');
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 text-white shadow-xl shadow-primary/20">
        <h1 className="text-3xl font-extrabold mb-2">Đặt lịch khám bệnh</h1>
        <p className="text-primary-50 opacity-90">Tìm kiếm bác sĩ và thẻ thời gian phù hợp nhất với bạn.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between px-4 sm:px-12 relative">
        <div className="absolute left-10 right-10 top-1/2 h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
        {[
          { num: 1, label: 'Chuyên khoa' },
          { num: 2, label: 'Giờ khám' },
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

      {/* Step 1: Specialty */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Stethoscope className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">Chọn Chuyên Khoa</h2>
          </div>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialties.map(spec => (
                <div
                  key={spec.id}
                  onClick={() => handleSelectSpecialty(spec)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 cursor-pointer transition-all group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{spec.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{spec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Schedule */}
      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Chọn lại khoa
          </button>

          <div className="flex items-center gap-2 px-2">
            <CalendarIcon className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">Lịch Khám - {selectedSpecialty?.name}</h2>
          </div>

          {fetchingSchedules ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : availableDates.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100 text-gray-500">
              Chưa có lịch khám trống cho chuyên khoa này. Vui lòng quay lại sau!
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {availableDates.map(date => {
                  const d = new Date(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center flex-shrink-0 px-6 py-3 rounded-2xl border-2 transition-all ${selectedDate === date
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <span className="text-xs uppercase font-bold mb-1">
                        {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-black">{d.getDate()}</span>
                      <span className="text-xs">{d.getMonth() + 1}/{d.getFullYear()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-6">
                {Object.values(groupedByDoctor).map(doc => (
                  <div key={doc.doctorName} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">BS. {doc.doctorName}</h4>
                        <p className="text-sm text-gray-500">{selectedSpecialty?.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {doc.schedules.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSchedule(s); setStep(3); }}
                          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-all group"
                        >
                          <Clock className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                          <span className="font-bold">{s.startTime.substring(0, 5)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedSchedule && (
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
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">BS. {selectedSchedule.doctorName}</h3>
                  <span className="inline-block px-3 py-1 bg-white rounded-full text-sm font-bold text-primary shadow-sm border border-primary/10">
                    {selectedSpecialty?.name}
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
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

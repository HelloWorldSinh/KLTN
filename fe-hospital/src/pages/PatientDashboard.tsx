import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { appointmentService, type AppointmentDTO } from '../services/appointment.service';
import { examinationService, type ExaminationResponse } from '../services/examination.service';
import { 
  LayoutDashboard, Calendar, Clock, Users, MapPin, 
  FileText, Pill, AlertCircle, ChevronRight, Loader2, CheckCircle
} from 'lucide-react';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';

export const PatientDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal details state
  const [examModal, setExamModal] = useState<{ 
    isOpen: boolean; 
    appointmentId: number | null; 
    data: ExaminationResponse | null; 
    loading: boolean; 
  }>({
    isOpen: false,
    appointmentId: null,
    data: null,
    loading: false
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Không thể tải thông tin tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExamination = async (id: number) => {
    setExamModal({ isOpen: true, appointmentId: id, data: null, loading: true });
    try {
      const data = await examinationService.getExamination(id);
      setExamModal({ isOpen: true, appointmentId: id, data, loading: false });
    } catch (err) {
      toast.error('Không thể tải thông tin kết quả khám');
      setExamModal({ isOpen: false, appointmentId: null, data: null, loading: false });
    }
  };

  // Logic to get the closest upcoming appointment
  const upcomingAppointments = appointments
    .filter(app => app.status === 'PENDING' || app.status === 'CONFIRMED')
    .sort((a, b) => {
      const dateA = new Date(`${a.workDate}T${a.startTime}`);
      const dateB = new Date(`${b.workDate}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  const nextAppointment = upcomingAppointments[0] || null;

  // Logic to get the 3 most recent completed appointments
  const completedAppointments = appointments
    .filter(app => app.status === 'COMPLETED')
    .sort((a, b) => {
      const dateA = new Date(`${a.workDate}T${a.startTime}`);
      const dateB = new Date(`${b.workDate}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
  const recentCompleted = completedAppointments.slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full text-amber-600 font-bold border border-amber-200/50 text-xs w-fit">
            <Clock className="w-3 h-3" /> Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-full text-blue-600 font-bold border border-blue-200/50 text-xs w-fit">
            <CheckCircle className="w-3 h-3" /> Đã xác nhận
          </span>
        );
      default:
        return null;
    }
  };

  const getTodayString = () => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="text-primary h-8 w-8" />
            Tổng quan sức khỏe
          </h1>
          <p className="text-gray-500 mt-1">Xem trạng thái hàng đợi, lịch hẹn sắp tới và kết quả điều trị của bạn.</p>
        </div>
        <div className="text-sm font-bold text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
          {getTodayString()}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Welcome Card & Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Welcome banner */}
            <div className="lg:col-span-3 bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white to-transparent" />
              <div className="relative z-10 space-y-2">
                <h2 className="text-3xl font-black">Xin chào, {user?.name || 'Bệnh nhân'}!</h2>
                <p className="text-teal-50 text-base leading-relaxed opacity-95">
                  Chào mừng bạn quay trở lại với Medicare. Hãy kiểm tra các thông tin cập nhật về lịch hẹn và kết quả điều trị của bạn ở dưới đây.
                </p>
              </div>
            </div>

            {/* Metric 1: Book Schedule */}
            <div 
              onClick={() => navigate('/patient/book')}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group flex items-center gap-5 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors">Đặt lịch khám mới</h4>
                <p className="text-slate-400 text-xs mt-1">Đăng ký lịch hẹn nhanh chóng</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
            </div>

            {/* Metric 2: Upcoming appointments list */}
            <div 
              onClick={() => navigate('/patient/schedule')}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group flex items-center gap-5 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-amber-600 transition-colors">Lịch khám sắp tới</h4>
                <p className="text-slate-400 text-xs mt-1">
                  {upcomingAppointments.length > 0 
                    ? `${upcomingAppointments.length} lịch khám sắp tới` 
                    : 'Chưa có lịch khám'
                  }
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-amber-600 transition-colors" />
            </div>

            {/* Metric 3: Patient Queue */}
            <div 
              onClick={() => navigate('/patient/queue')}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group flex items-center gap-5 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">Hàng đợi khám</h4>
                <p className="text-slate-400 text-xs mt-1">Theo dõi vị trí khám hôm nay</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-emerald-600 transition-colors" />
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Next Appointment (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-lg px-1 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Lịch hẹn tiếp theo
              </h3>
              
              {nextAppointment ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100 font-extrabold text-lg">
                        {nextAppointment.doctorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-800">BS. {nextAppointment.doctorName}</h4>
                        <p className="text-xs text-gray-400 font-bold tracking-wide mt-0.5">{nextAppointment.specialtyName || 'Chuyên khoa'}</p>
                      </div>
                    </div>
                    {getStatusBadge(nextAppointment.status)}
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-slate-50 pl-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-700">
                        {new Date(nextAppointment.workDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-bold text-slate-700">
                        {nextAppointment.startTime.substring(0, 5)} - {nextAppointment.endTime.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-700">Phòng: {nextAppointment.room}</span>
                    </div>
                    {nextAppointment.queueOrder !== undefined && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-teal-500 shrink-0" />
                        <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs border border-teal-200/40">
                          Số thứ tự của bạn: {nextAppointment.queueOrder}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => navigate('/patient/schedule')}
                      className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-100 active:scale-95 cursor-pointer text-center"
                    >
                      Quản lý lịch
                    </button>
                    {nextAppointment.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => navigate('/patient/queue')}
                        className="flex-1 bg-primary text-white hover:bg-primary-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 active:scale-95 cursor-pointer text-center"
                      >
                        Vào phòng chờ
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">Chưa có lịch khám sắp tới</h4>
                    <p className="text-xs text-slate-400 mt-1">Đăng ký khám sức khỏe ngay để được hỗ trợ.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/patient/book')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/10 active:scale-95 cursor-pointer"
                  >
                    Đăng ký đặt lịch ngay
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Recent Medical History (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-lg px-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Lịch sử khám bệnh gần đây
              </h3>

              {recentCompleted.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Bác sĩ / Khoa</th>
                          <th className="px-6 py-4">Ngày khám</th>
                          <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recentCompleted.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-slate-700 block">BS. {app.doctorName}</span>
                              <span className="text-[11px] font-bold text-primary">{app.specialtyName || 'Chuyên khoa'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-600 text-xs">
                                {new Date(app.workDate).toLocaleDateString('vi-VN')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewExamination(app.id)}
                                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 text-xs font-bold border border-emerald-100 transition-colors cursor-pointer"
                              >
                                Xem kết quả
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-slate-200" />
                  <p className="font-semibold text-slate-500 text-sm">Chưa ghi nhận lịch sử khám bệnh</p>
                  <p className="text-[11px] text-slate-400">Kết quả và đơn thuốc sau khi khám xong sẽ được cập nhật tại đây.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Examination Detail Modal */}
      {examModal.isOpen && (
        <Modal
          isOpen={examModal.isOpen}
          onClose={() => setExamModal({ isOpen: false, appointmentId: null, data: null, loading: false })}
          title="Kết Quả Khám Bệnh & Đơn Thuốc"
          icon={FileText}
          maxWidth="2xl"
        >
          <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
            {examModal.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Đang tải kết quả...</p>
              </div>
            ) : examModal.data ? (
              <div className="space-y-6">
                
                {/* Diagnosis Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2 border-b pb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Chẩn đoán lâm sàng
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100/50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Triệu chứng của bệnh nhân:</p>
                      <p className="text-slate-800 text-sm font-medium">{examModal.data.symptom || 'Không có ghi nhận triệu chứng'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Kết luận chẩn đoán:</p>
                      <p className="text-slate-800 text-sm font-extrabold bg-white p-3 rounded-xl border border-slate-100">
                        {examModal.data.diagnosis || 'Chưa có cập nhật chẩn đoán'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prescription Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2 border-b pb-2">
                    <Pill className="w-5 h-5 text-emerald-500" />
                    Đơn thuốc chỉ định
                  </h4>
                  {examModal.data.prescriptionDetails && examModal.data.prescriptionDetails.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr className="text-slate-400 text-xs font-bold uppercase">
                            <th className="px-4 py-3">Thuốc</th>
                            <th className="px-4 py-3 w-24 text-center">Đơn vị</th>
                            <th className="px-4 py-3 w-20 text-center">SL</th>
                            <th className="px-4 py-3">Liều dùng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {examModal.data.prescriptionDetails.map((med, idx) => (
                            <tr key={med.medicineId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-4 font-bold text-slate-800 flex items-center gap-3">
                                <span className="w-5 h-5 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black">{idx + 1}</span>
                                {med.medicineName}
                              </td>
                              <td className="px-4 py-4 text-center text-gray-500 font-medium text-xs">{med.medicineUnit || '—'}</td>
                              <td className="px-4 py-4 text-center font-extrabold text-primary text-base">{med.quantity}</td>
                              <td className="px-4 py-4 text-gray-500 font-medium text-xs leading-relaxed">{med.dosage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm font-medium">Bác sĩ không chỉ định đơn thuốc cho ca khám này.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-medium">Không tìm thấy dữ liệu kết quả khám.</div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setExamModal({ isOpen: false, appointmentId: null, data: null, loading: false })}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer text-sm"
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

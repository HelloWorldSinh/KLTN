import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, FileText, Pill } from 'lucide-react';
import { appointmentService, type AppointmentDTO } from '../services/appointment.service';
import { examinationService, type ExaminationResponse } from '../services/examination.service';
import toast from 'react-hot-toast';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ isOpen: boolean, appointmentId: number | null }>({ isOpen: false, appointmentId: null });
  const [cancelReason, setCancelReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');
  const [filterType, setFilterType] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [examModal, setExamModal] = useState<{ isOpen: boolean, appointmentId: number | null, data: ExaminationResponse | null, loading: boolean }>({
    isOpen: false,
    appointmentId: null,
    data: null,
    loading: false
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Lỗi khi tải lịch sử khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const handleCancelClick = (id: number) => {
    setCancelDialog({ isOpen: true, appointmentId: id });
    setCancelReason('');
    setOtherReason('');
  };

  const handleConfirmCancel = async () => {
    const id = cancelDialog.appointmentId;
    if (!id) return;

    let finalReason = cancelReason;
    if (cancelReason === 'Lý do khác') {
      finalReason = otherReason.trim();
    }

    setCancellingId(id);
    try {
      const res = await appointmentService.cancelAppointment(id, finalReason);
      if (res.status) {
        toast.success('Hủy lịch thành công');
        fetchAppointments();
        setCancelDialog({ isOpen: false, appointmentId: null });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi hủy lịch');
    } finally {
      setCancellingId(null);
    }
  };

  const AppointmentStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-600 font-bold border border-amber-200/50 text-xs"><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-blue-600 font-bold border border-blue-200/50 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-emerald-600 font-bold border border-emerald-200/50 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Đã hoàn thành</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full text-red-600 font-bold border border-red-200/50 text-xs"><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
      case 'NO_SHOW':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full text-red-600 font-bold border border-red-200/50 text-xs"><XCircle className="w-3.5 h-3.5" /> Không đến khám</span>;
      case 'SYSTEM_CANCELLED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full text-red-600 font-bold border border-red-200/50 text-xs"><XCircle className="w-3.5 h-3.5" /> Hệ thống hủy</span>;
      default:
        return null;
    }
  };

  const filteredAppointments = appointments
    .filter(app => {
      if (filterType === 'UPCOMING') return app.status === 'PENDING' || app.status === 'CONFIRMED';
      if (filterType === 'COMPLETED') return app.status === 'COMPLETED';
      if (filterType === 'CANCELLED') return app.status === 'CANCELLED' || app.status === 'NO_SHOW' || app.status === 'SYSTEM_CANCELLED';
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.workDate}T${a.startTime}`);
      const dateB = new Date(`${b.workDate}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });

  const getEmptyMessage = () => {
    switch (filterType) {
      case 'UPCOMING': return 'Bạn không có lịch hẹn nào sắp tới.';
      case 'COMPLETED': return 'Bạn chưa có lịch khám nào đã hoàn thành.';
      case 'CANCELLED': return 'Không có lịch hẹn nào bị hủy.';
      default: return 'Bạn chưa có lịch hẹn nào.';
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Calendar className="text-primary h-8 w-8" />
            Lịch hẹn của tôi
          </h1>
          <p className="text-gray-500 mt-1">Tra cứu thông tin, quản lý và theo dõi trạng thái các cuộc hẹn.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-fit overflow-x-auto custom-scrollbar">
        {[
          { id: 'UPCOMING', label: 'Sắp đến' },
          { id: 'COMPLETED', label: 'Đã khám' },
          { id: 'CANCELLED', label: 'Đã hủy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === tab.id
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy lịch hẹn</h3>
          <p className="text-gray-500 mb-6">{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAppointments.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AppointmentStatusBadge status={app.status} />
                    {(app.status === 'PENDING' || app.status === 'CONFIRMED') && app.queueOrder !== undefined && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 rounded-full text-teal-600 font-bold border border-teal-200/50 text-xs">
                        Số thứ tự: {app.queueOrder}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-3 mb-1">BS. {app.doctorName}</h3>
                  <p className="text-gray-500 text-sm font-medium">{app.specialtyName}</p>
                  {(app.status === 'CANCELLED' || app.status === 'NO_SHOW' || app.status === 'SYSTEM_CANCELLED') && app.cancelReason && (
                    <div className="mt-3 text-sm text-red-600 bg-red-50/50 rounded-xl p-3 border border-red-100/50 flex items-start gap-2 max-w-md">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-red-700">Lý do hủy:</span> {app.cancelReason}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase font-bold text-gray-400 mb-1">Ngày khám</p>
                  <p className="font-extrabold text-gray-800 text-lg">
                    {new Date(app.workDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-gray-700 text-sm">{app.startTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-gray-700 text-sm">{app.room}</span>
                  </div>
                </div>

                {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancelClick(app.id)}
                    disabled={cancellingId === app.id}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {cancellingId === app.id ? 'Đang hủy...' : 'Hủy lịch hẹn'}
                  </button>
                )}

                {app.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleViewExamination(app.id)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 text-sm font-bold transition-colors border border-emerald-200"
                  >
                    Xem kết quả & Đơn thuốc
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Dialog Modal */}
      {cancelDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Hủy lịch hẹn
            </h3>
            <p className="text-gray-500 text-sm mb-4">Vui lòng cho chúng tôi biết lý do bạn muốn hủy lịch hẹn này:</p>

            <div className="space-y-3 mb-6">
              {['Tôi bận việc đột xuất', 'Tôi đã đặt lịch nơi khác', 'Thay đổi bác sĩ / khoa khám', 'Lý do khác'].map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">{reason}</span>
                </label>
              ))}

              {cancelReason === 'Lý do khác' && (
                <textarea
                  autoFocus
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Nhập lý do của bạn..."
                  className="w-full mt-2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  rows={3}
                />
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelDialog({ isOpen: false, appointmentId: null })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={cancellingId !== null}
              >
                Đóng
              </button>
              <button
                disabled={cancellingId !== null || (cancelReason === 'Lý do khác' && !otherReason.trim()) || !cancelReason}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingId !== null && <Loader2 className="w-5 h-5 animate-spin" />}
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Examination Detail Modal */}
      {examModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Kết quả khám bệnh
              </h3>
              <button
                onClick={() => setExamModal({ isOpen: false, appointmentId: null, data: null, loading: false })}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {examModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-gray-500 font-medium">Đang tải hồ sơ...</p>
                </div>
              ) : examModal.data ? (
                <div className="space-y-8">
                  {/* Diagnosis Section */}
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Chẩn đoán
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                      <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Triệu chứng của bệnh nhân:</p>
                        <p className="text-gray-800 font-medium">{examModal.data.symptom || 'Không có ghi nhận'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-500 mb-1">Kết luận của bác sĩ:</p>
                        <p className="text-gray-800 font-bold bg-white p-3 rounded-xl border border-gray-100">
                          {examModal.data.diagnosis || 'Chưa cập nhật...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Section */}
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                      <Pill className="w-5 h-5 text-emerald-500" />
                      Đơn thuốc chỉ định
                    </h4>
                    {examModal.data.prescriptionDetails && examModal.data.prescriptionDetails.length > 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-bold text-gray-500">Thuốc</th>
                              <th className="px-4 py-3 font-bold text-gray-500 w-24 text-center">Đơn vị</th>
                              <th className="px-4 py-3 font-bold text-gray-500 w-24 text-center">SL</th>
                              <th className="px-4 py-3 font-bold text-gray-500">Liều dùng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {examModal.data.prescriptionDetails.map((med, idx) => (
                              <tr key={med.medicineId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4 font-bold text-gray-800 flex items-center gap-3">
                                  <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-xs">{idx + 1}</span>
                                  {med.medicineName}
                                </td>
                                <td className="px-4 py-4 text-center text-gray-500 font-medium text-sm">{med.medicineUnit || '—'}</td>
                                <td className="px-4 py-4 text-center font-black text-primary text-lg">{med.quantity}</td>
                                <td className="px-4 py-4 text-gray-600 font-medium">{med.dosage}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 shadow-inner">
                        <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Bác sĩ không kê đơn thuốc cho lịch khám này.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 font-medium">Không tìm thấy dữ liệu kết quả khám.</div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button
                onClick={() => setExamModal({ isOpen: false, appointmentId: null, data: null, loading: false })}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

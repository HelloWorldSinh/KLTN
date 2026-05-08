import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Pill,
  Save,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { examinationService, type ExaminationResponse, type PrescriptionDetailResponse } from '../services/examination.service';
import { medicineService, type MedicineDTO } from '../services/medicine.service';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/format';

export const ExaminationPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'prescription'>('diagnosis');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [examData, setExamData] = useState<ExaminationResponse | null>(null);
  const [symptom, setSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  // Prescription states
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetailResponse[]>([]);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [showMedicineList, setShowMedicineList] = useState(false);

  const id = parseInt(appointmentId || '0');
  const isReadOnly = examData?.status === 'COMPLETED';

  useEffect(() => {
    fetchData();
    fetchMedicines();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await examinationService.getExamination(id);
      setExamData(data);
      setSymptom(data.symptom || '');
      setDiagnosis(data.diagnosis || '');
      setSelectedPrescription(data.prescriptionDetails || []);
    } catch (err) {
      toast.error('Lỗi khi tải thông tin khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data.filter(m => m.active));
    } catch (err) {
      console.error('Lỗi tải danh mục thuốc');
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }
    setSubmitting(true);
    try {
      const res = await examinationService.saveExamination(id, { symptom, diagnosis });
      if (res.status) {
        toast.success('Đã lưu thông tin chẩn đoán');
        // Refresh to enable Tab 2 if it was blocked
        const updated = await examinationService.getExamination(id);
        setExamData(updated);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePrescription = async () => {
    setSubmitting(true);
    try {
      const details = selectedPrescription.map(p => ({
        medicineId: p.medicineId,
        quantity: p.quantity,
        dosage: p.dosage
      }));
      const res = await examinationService.savePrescription(id, { details });
      if (res.status) {
        toast.success('Đã lưu đơn thuốc');
        fetchData(); // Refresh để thấy lịch sử cập nhật mới
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Lỗi khi lưu đơn thuốc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Sau khi kết thúc, hồ sơ sẽ bị khóa và không thể chỉnh sửa. Bạn chắc chắn chứ?')) return;

    setSubmitting(true);
    try {
      const res = await examinationService.completeExamination(id);
      if (res.status) {
        toast.success('Đã kết thúc ca khám');
        navigate('/doctor/patients');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi hoàn tất');
    } finally {
      setSubmitting(false);
    }
  };

  const addMedicine = (med: MedicineDTO) => {
    if (selectedPrescription.find(p => p.medicineId === med.id)) {
      toast.error('Thuốc này đã có trong đơn');
      return;
    }
    setSelectedPrescription([...selectedPrescription, {
      medicineId: med.id!,
      medicineName: med.name,
      quantity: 1,
      dosage: ''
    }]);
    setShowMedicineList(false);
    setSearchMedicine('');
  };

  const removeMedicine = (medId: number) => {
    setSelectedPrescription(selectedPrescription.filter(p => p.medicineId !== medId));
  };

  const updateMedicineDetail = (medId: number, field: keyof PrescriptionDetailResponse, value: any) => {
    setSelectedPrescription(selectedPrescription.map(p =>
      p.medicineId === medId ? { ...p, [field]: value } : p
    ));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-500 font-medium animate-pulse">Đang tải hồ sơ bệnh án...</p>
      </div>
    );
  }

  const isTab2Blocked = !examData?.diagnosis;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/doctor/patients')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>
        {isReadOnly && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Hồ sơ đã hoàn tất
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-gray-100 p-2 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all ${activeTab === 'diagnosis'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <Stethoscope className="w-5 h-5" />
            1. Khám & Chẩn đoán
          </button>
          <button
            disabled={isTab2Blocked && !isReadOnly}
            onClick={() => setActiveTab('prescription')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all relative ${activeTab === 'prescription'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
          >
            <Pill className="w-5 h-5" />
            2. Kê đơn thuốc
            {isTab2Blocked && !isReadOnly && (
              <div className="absolute -top-1 -right-1 bg-amber-100 p-1 rounded-full border border-amber-200">
                <AlertCircle className="w-3 h-3 text-amber-500" />
              </div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'diagnosis' ? (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Triệu chứng / Lý do khám
                  </label>
                  <textarea
                    readOnly={isReadOnly}
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="Nhập các triệu chứng quan sát được..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Chẩn đoán bệnh <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    readOnly={isReadOnly}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Nhập kết quả chẩn đoán cuối cùng..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[120px]"
                  />
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleSaveDiagnosis}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu thông tin khám
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="w-6 h-6 text-primary" />
                  Kê đơn thuốc cho bệnh nhân
                </h2>
                {isReadOnly && (
                  <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    Chế độ cập nhật hậu lâm sàng
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thuốc theo tên..."
                    value={searchMedicine}
                    onChange={(e) => {
                      setSearchMedicine(e.target.value);
                      setShowMedicineList(true);
                    }}
                    onFocus={() => setShowMedicineList(true)}
                    className="flex-1 bg-transparent border-b-2 border-gray-100 focus:border-primary outline-none py-2 font-medium"
                  />
                </div>

                {showMedicineList && searchMedicine && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                    {medicines
                      .filter(m => m.name.toLowerCase().includes(searchMedicine.toLowerCase()))
                      .map(m => (
                        <div
                          key={m.id}
                          onClick={() => addMedicine(m)}
                          className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                        >
                          <span className="font-bold text-gray-700">{m.name}</span>
                          <Plus className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {selectedPrescription.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Chưa có thuốc nào trong đơn này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPrescription.map((item, idx) => (
                    <div key={item.medicineId} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{idx + 1}. {item.medicineName}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                          <span className="text-xs font-bold text-gray-400">SL:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateMedicineDetail(item.medicineId, 'quantity', parseInt(e.target.value))}
                            className="w-12 bg-transparent outline-none font-black text-primary text-center"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 min-w-[200px]">
                          <span className="text-xs font-bold text-gray-400">HD:</span>
                          <input
                            placeholder="Liều dùng..."
                            value={item.dosage}
                            onChange={(e) => updateMedicineDetail(item.medicineId, 'dosage', e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm font-medium"
                          />
                        </div>
                        <button
                          onClick={() => removeMedicine(item.medicineId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 items-center">
                {isReadOnly && (
                  <p className="text-xs text-gray-400 font-medium mr-auto">
                    * Lưu ý: Hồ sơ này đã đóng, việc thay đổi đơn thuốc sẽ được lưu vào lịch sử cập nhật.
                  </p>
                )}
                <button
                  onClick={handleSavePrescription}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Cập nhật đơn thuốc
                </button>
              </div>

              {/* Update History Display */}
              {examData?.lastUpdated && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Đơn thuốc cập nhật lần cuối lúc:
                  </h4>
                  <div className="inline-block bg-primary/5 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/10">
                    {formatDateTime(examData.lastUpdated)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {!isReadOnly && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleComplete}
            disabled={submitting || !examData?.diagnosis}
            className="flex items-center gap-3 px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-600 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            <CheckCircle2 className="w-6 h-6" />
            KẾT THÚC KHÁM & ĐÓNG HỒ SƠ
          </button>
        </div>
      )}
    </div>
  );
};

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
  RotateCcw,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  room: string;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'MISSED' | 'COMPLETED';
  displayStatus: string;
  queuePosition?: number;
  absentSecondsRemaining?: number; // Đếm ngược 30 phút bằng giây (1800 giây)
  doctorId: number;
}

export const StaffQueue = () => {
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Danh sách bác sĩ trực hôm nay
  const doctors: Doctor[] = [
    { id: 1, name: 'BS. Bùi Quang Huy', specialty: 'Nội khoa', room: 'Phòng 102' },
    { id: 2, name: 'BS. Nguyễn Thị Mai', specialty: 'Nhi khoa', room: 'Phòng 103' },
    { id: 3, name: 'BS. Trần Văn Nam', specialty: 'Tai Mũi Họng', room: 'Phòng 105' }
  ];

  // Danh sách bệnh nhân (tổng hợp của tất cả các bác sĩ)
  const [allPatients, setAllPatients] = useState<Patient[]>([
    // Bác sĩ Huy (ID = 1)
    { id: 201, name: 'Phạm Hoàng Nam', phone: '0901112222', timeSlot: '08:00 - 12:00', status: 'IN_PROGRESS', displayStatus: 'Đang khám', queuePosition: 1, doctorId: 1 },
    { id: 202, name: 'Ngô Quốc Anh', phone: '0903334444', timeSlot: '08:00 - 12:00', status: 'WAITING', displayStatus: 'Chuẩn bị', queuePosition: 2, doctorId: 1 },
    { id: 203, name: 'Lê Thùy Chi', phone: '0905556666', timeSlot: '08:00 - 12:00', status: 'WAITING', displayStatus: 'Chờ khám', queuePosition: 3, doctorId: 1 },
    { id: 301, name: 'Đỗ Minh Quân', phone: '0903333333', timeSlot: '08:00 - 12:00', status: 'MISSED', displayStatus: 'Vắng mặt', absentSecondsRemaining: 900, doctorId: 1 }, // 15 phút
    { id: 302, name: 'Hoàng Thúy Vy', phone: '0904444444', timeSlot: '08:00 - 12:00', status: 'MISSED', displayStatus: 'Vắng mặt', absentSecondsRemaining: 45, doctorId: 1 },  // 45 giây
    { id: 303, name: 'Bùi Quang Tuấn', phone: '0905555555', timeSlot: '08:00 - 12:00', status: 'MISSED', displayStatus: 'Vắng mặt', absentSecondsRemaining: 0, doctorId: 1 },   // Quá hạn

    // Bác sĩ Mai (ID = 2)
    { id: 401, name: 'Trần Đức Anh', phone: '0912223333', timeSlot: '08:00 - 12:00', status: 'IN_PROGRESS', displayStatus: 'Đang khám', queuePosition: 1, doctorId: 2 },
    { id: 402, name: 'Vũ Hải Yến', phone: '0914445555', timeSlot: '08:00 - 12:00', status: 'WAITING', displayStatus: 'Chuẩn bị', queuePosition: 2, doctorId: 2 },
    { id: 403, name: 'Đặng Văn Lâm', phone: '0915556666', timeSlot: '08:00 - 12:00', status: 'MISSED', displayStatus: 'Vắng mặt', absentSecondsRemaining: 1200, doctorId: 2 },

    // Bác sĩ Nam (ID = 3)
    { id: 501, name: 'Nguyễn Hoàng Bách', phone: '0983332222', timeSlot: '08:00 - 12:00', status: 'WAITING', displayStatus: 'Chuẩn bị', queuePosition: 1, doctorId: 3 }
  ]);

  // Bộ đếm ngược giây tự động cho bệnh nhân vắng mặt
  useEffect(() => {
    const timer = setInterval(() => {
      setAllPatients(prevPatients =>
        prevPatients.map(p => {
          if (p.status === 'MISSED' && p.absentSecondsRemaining !== undefined && p.absentSecondsRemaining > 0) {
            return { ...p, absentSecondsRemaining: p.absentSecondsRemaining - 1 };
          }
          return p;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Lọc danh sách bác sĩ dựa theo ô tìm kiếm
  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // Lấy bác sĩ hiện tại đang chọn
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Lấy danh sách hàng đợi khám của bác sĩ đang chọn
  const activeQueue = allPatients
    .filter(p => p.doctorId === selectedDoctorId && p.status !== 'MISSED' && p.status !== 'COMPLETED')
    .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

  // Lấy danh sách bệnh nhân vắng mặt của bác sĩ đang chọn
  const absentQueue = allPatients
    .filter(p => p.doctorId === selectedDoctorId && p.status === 'MISSED');

  // Format giây đếm ngược
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Làm mới danh sách
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(`Đồng bộ hàng đợi của ${selectedDoctor.name} thành công!`);
    }, 800);
  };

  // Xử lý gọi lại bệnh nhân vắng mặt (Recall)
  const handleRecall = (patient: Patient, isPriority: boolean) => {
    setAllPatients(prevPatients => {
      // 1. Tìm tất cả các bệnh nhân ĐANG CHỜ của bác sĩ này (không bao gồm MISSED, COMPLETED)
      const docActiveQueue = prevPatients
        .filter(p => p.doctorId === patient.doctorId && p.status !== 'MISSED' && p.status !== 'COMPLETED')
        .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

      let updatedActiveQueue = [...docActiveQueue];

      if (isPriority) {
        // Logic: Chèn vào vị trí thứ 3 (index 2) trong danh sách chờ của bác sĩ này
        const insertIndex = Math.min(2, updatedActiveQueue.length);
        const recalledItem: Patient = {
          ...patient,
          status: 'WAITING',
          displayStatus: insertIndex === 0 ? 'Chuẩn bị' : 'Chờ khám',
          absentSecondsRemaining: undefined
        };
        updatedActiveQueue.splice(insertIndex, 0, recalledItem);

        toast.success(`[ƯU TIÊN 30 PHÚT] Gọi lại bệnh nhân ${patient.name}. Chèn vào vị trí thứ 3 hàng chờ.`);
      } else {
        // Logic: Xếp xuống cuối hàng chờ của bác sĩ này
        const recalledItem: Patient = {
          ...patient,
          status: 'WAITING',
          displayStatus: updatedActiveQueue.length === 0 ? 'Chuẩn bị' : 'Chờ khám',
          absentSecondsRemaining: undefined
        };
        updatedActiveQueue.push(recalledItem);

        toast.error(`[QUÁ HẠN ƯU TIÊN] Bệnh nhân ${patient.name} đã quá 30 phút. Xếp xuống cuối hàng chờ.`);
      }

      // 2. Cập nhật lại queuePosition cho danh sách chờ mới của bác sĩ này
      const reindexedActiveQueue = updatedActiveQueue.map((item, idx) => ({
        ...item,
        queuePosition: idx + 1,
        displayStatus: idx === 0 && item.status !== 'IN_PROGRESS' ? 'Chuẩn bị' : (item.status === 'IN_PROGRESS' ? 'Đang khám' : 'Chờ khám')
      }));

      // 3. Ghép lại danh sách tổng hợp (giữ nguyên bệnh nhân của các bác sĩ khác và cập nhật danh sách bác sĩ này)
      const otherPatients = prevPatients.filter(p => p.doctorId !== patient.doctorId || p.id === patient.id);
      
      // Xóa bệnh nhân cũ khỏi danh sách vắng mặt của bác sĩ này
      const filteredOtherPatients = otherPatients.filter(p => p.id !== patient.id);

      return [...filteredOtherPatients, ...reindexedActiveQueue];
    });
  };

  // Giả lập bác sĩ đánh vắng bệnh nhân đang chờ khám (ở cột 1)
  const simulateDoctorMarkAbsent = () => {
    const waitList = activeQueue.filter(p => p.status === 'WAITING');
    if (waitList.length === 0) {
      toast.error(`Không có bệnh nhân chờ khám nào của ${selectedDoctor.name} để đánh vắng!`);
      return;
    }
    const patientToMiss = waitList[0];

    setAllPatients(prev => {
      return prev.map(p => {
        if (p.id === patientToMiss.id) {
          return {
            ...p,
            status: 'MISSED' as const,
            displayStatus: 'Vắng mặt',
            absentSecondsRemaining: 1800 // Reset 30 phút
          };
        }
        return p;
      }).map(p => {
        // Cập nhật lại số thứ tự cho các bệnh nhân còn lại trong hàng chờ của bác sĩ này
        if (p.doctorId === selectedDoctorId && p.status !== 'MISSED' && p.status !== 'COMPLETED') {
          // Chúng ta sẽ tính lại index sau, tạm thời giữ nguyên
        }
        return p;
      });
    });

    // Cập nhật lại chỉ số hàng chờ
    setAllPatients(prev => {
      const docWaiting = prev
        .filter(p => p.doctorId === selectedDoctorId && p.status !== 'MISSED' && p.status !== 'COMPLETED')
        .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
      
      const reindexed = docWaiting.map((p, idx) => ({
        ...p,
        queuePosition: idx + 1,
        displayStatus: idx === 0 && p.status !== 'IN_PROGRESS' ? 'Chuẩn bị' : (p.status === 'IN_PROGRESS' ? 'Đang khám' : 'Chờ khám')
      }));

      const others = prev.filter(p => p.doctorId !== selectedDoctorId || p.status === 'MISSED' || p.status === 'COMPLETED');
      return [...others, ...reindexed];
    });

    toast.error(`[SSE] Bác sĩ vừa đánh vắng bệnh nhân ${patientToMiss.name}! Đã tự động cập nhật sang danh sách vắng mặt.`, {
      duration: 4000
    });
  };

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
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-2 text-sm text-slate-700 font-bold">
            <MapPin className="w-4 h-4 text-primary font-bold" />
            <span>Phòng khám điều hành: {selectedDoctor.room}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-500 rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60"
            title="Đồng bộ danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid 2 cột: Cột trái (Hàng đợi & lọc BS), Cột phải (Vắng mặt & đếm ngược) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI (Rộng 2/3): HÀNG ĐỢI KHÁM & BỘ LỌC BÁC SĨ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            
            {/* Thanh Tìm kiếm và Chọn Bác sĩ */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                    Hàng đợi khám theo Bác sĩ
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Tìm kiếm bác sĩ và xem hàng đợi khám thực tế</p>
                </div>
                
                {/* Tìm bác sĩ */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc chuyên khoa..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Lưới các bác sĩ (Tabs lọc) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {filteredDoctors.length === 0 ? (
                  <p className="text-xs font-bold text-red-500 py-2">Không tìm thấy bác sĩ phù hợp.</p>
                ) : (
                  filteredDoctors.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDoctorId(d.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedDoctorId === d.id
                          ? 'bg-primary border-primary text-white shadow-[0_4px_12px_rgba(15,118,110,0.2)]'
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Stethoscope className={`w-4 h-4 ${selectedDoctorId === d.id ? 'text-white' : 'text-primary'}`} />
                        <h4 className="font-extrabold text-xs tracking-tight">{d.name}</h4>
                      </div>
                      <p className={`text-[10px] mt-1 font-semibold ${selectedDoctorId === d.id ? 'text-teal-50' : 'text-slate-400'}`}>
                        {d.specialty} | {d.room}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chi tiết Hàng đợi khám */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Hàng chờ của {selectedDoctor.name}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                  {activeQueue.length} người chờ
                </span>
              </div>

              {activeQueue.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-3" />
                  <h4 className="font-bold text-slate-800 text-sm">Hàng đợi khám trống</h4>
                  <p className="text-xs text-slate-500 mt-1">Tất cả bệnh nhân đã khám xong hoặc chưa check-in.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQueue.map(p => (
                    <div
                      key={p.id}
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
                          <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{p.phone}</p>
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

            {/* Giả lập bác sĩ đánh vắng */}
            {activeQueue.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={simulateDoctorMarkAbsent}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                  Simulate: Bác sĩ của phòng khám đánh vắng bệnh nhân đang chờ
                </button>
              </div>
            )}

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

          {/* Hướng dẫn quy tắc */}
          <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100/60 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 leading-relaxed font-semibold">
              Quy tắc 30 phút: Gọi lại trong vòng 30 phút sẽ được ưu tiên chèn vào <b>vị trí thứ 3</b>. Nếu quá hạn sẽ buộc phải <b>"Xếp cuối hàng"</b>.
            </div>
          </div>

          {/* Danh sách vắng mặt */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {absentQueue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-xs font-bold text-center">Không có bệnh nhân vắng mặt của bác sĩ này</p>
              </div>
            ) : (
              absentQueue.map(p => {
                const isTimeUp = p.absentSecondsRemaining === 0;
                return (
                  <div
                    key={p.id}
                    className={`border rounded-2xl p-4 transition-all ${
                      isTimeUp ? 'bg-red-50/20 border-red-100/60' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{p.phone}</p>
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
                              {formatTime(p.absentSecondsRemaining || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed border-slate-200/60">
                      {!isTimeUp ? (
                        <button
                          onClick={() => handleRecall(p, true)}
                          className="flex-1 py-2 px-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl text-xs font-black hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Gọi lại (Ưu tiên)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRecall(p, false)}
                          className="flex-1 py-2 px-3 bg-slate-500 text-white rounded-xl text-xs font-black hover:bg-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Xếp cuối hàng
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
    </div>
  );
};

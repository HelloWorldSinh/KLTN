import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Stethoscope, Calendar, Phone, Mail, GraduationCap, Clock, Filter, X, Eye, BookOpen } from 'lucide-react';
import { doctorService, type DoctorResponse } from '../services/doctor.service';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';

export const SearchDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);

  // Modal Details State
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialtyId]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [doctorsData, specialtiesData] = await Promise.all([
        doctorService.getAllDoctors(),
        specialtyService.getAllSpecialties()
      ]);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
      toast.error('Lỗi tải dữ liệu bác sĩ');
    } finally {
      setLoading(false);
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
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleBookDoctor = (doctor: DoctorResponse) => {
    // Navigate to booking page and pass the selected doctor
    navigate('/patient/book', { 
      state: { 
        preselectedSpecialtyId: doctor.specialtyId,
        preselectedDoctorId: doctor.id 
      } 
    });
  };

  // Filtered Doctors List
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.degree && doc.degree.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.specialtyName && doc.specialtyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = selectedSpecialtyId === null || doc.specialtyId === selectedSpecialtyId;

    return matchesSearch && matchesSpecialty;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Stethoscope className="text-primary h-8 w-8" />
            Đội Ngũ Bác Sĩ Chuyên Khoa
          </h1>
          <p className="text-gray-500 mt-1">
            Tra cứu thông tin, học vị, chuyên môn và đặt lịch khám trực tiếp với các bác sĩ đầu ngành của MediCare.
          </p>
        </div>
      </div>

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
          ) : error ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-20 shadow-sm text-center space-y-4">
              <p className="text-red-500 font-semibold">{error}</p>
              <button
                onClick={fetchData}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all"
              >
                Tải lại dữ liệu
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-20 shadow-sm text-center text-slate-400 space-y-3">
              <User className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-500">Không tìm thấy bác sĩ nào phù hợp.</p>
              <p className="text-xs text-slate-400">Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc chuyên khoa.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentDoctors.map((doctor) => {
                  const experience = getExperienceYears(doctor.startWorkingDate);
                  return (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col group relative overflow-hidden"
                    >
                      {/* Hover Effect Border */}
                      <div className="absolute left-0 right-0 top-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                      {/* Top Avatar & Name Info */}
                      <div className="flex gap-4 items-start mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-50 flex items-center justify-center text-primary border border-primary/15 font-black text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                          {doctor.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors leading-snug line-clamp-1">
                            BS. {doctor.fullName}
                          </h4>
                          {doctor.degree && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {doctor.degree}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specialty & Details info */}
                      <div className="space-y-3 flex-1 mb-6 text-sm text-slate-500">
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

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <button
                          onClick={() => handleOpenDetails(doctor)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 hover:border-primary hover:text-primary rounded-xl text-xs font-bold text-slate-600 bg-white transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleBookDoctor(doctor)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
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

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Thông Tin Chi Tiết Bác Sĩ`}
          icon={BookOpen}
          maxWidth="3xl"
        >
          <div className="p-8 space-y-6">
            {/* Top Section Profile summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/10 to-indigo-50 border border-primary/20 flex items-center justify-center text-primary font-black text-3xl shadow-inner shadow-primary/5">
                {selectedDoctor.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="text-2xl font-black text-slate-800">BS. {selectedDoctor.fullName}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {selectedDoctor.specialtyName || 'Chưa phân khoa'}
                  </span>
                  {selectedDoctor.degree && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {selectedDoctor.degree}
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
                    <span>Giới tính: <span className="font-bold text-slate-700">{selectedDoctor.gender === 'MALE' ? 'Nam' : selectedDoctor.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span></span>
                  </div>
                  {selectedDoctor.dob && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Ngày sinh: <span className="font-bold text-slate-700">{new Date(selectedDoctor.dob).toLocaleDateString('vi-VN')}</span></span>
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
                    <span>Số điện thoại: <span className="font-bold text-slate-700">{selectedDoctor.phone}</span></span>
                  </div>
                  {selectedDoctor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">Email: <span className="font-bold text-slate-700">{selectedDoctor.email}</span></span>
                    </div>
                  )}
                  {selectedDoctor.startWorkingDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Thâm niên: <span className="font-bold text-slate-700">{getExperienceYears(selectedDoctor.startWorkingDate)} năm ({new Date(selectedDoctor.startWorkingDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })})</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); handleBookDoctor(selectedDoctor); }}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Đặt lịch hẹn ngay
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

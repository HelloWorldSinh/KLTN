import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ShieldAlert,
  Building2,
  FileText,
  BarChart3
} from 'lucide-react';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { Modal } from '../components/Modal';

export const SpecialtyManagement = () => {
  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyDTO | null>(null);
  const [formData, setFormData] = useState<SpecialtyDTO>({
    name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const data = await specialtyService.getAllSpecialties();
      setSpecialties(data);
    } catch (err) {
      setError('Không thể tải danh sách chuyên khoa. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  // Show success message temporarily
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chuyên khoa này? \nHành động này không thể hoàn tác.`)) {
      try {
        const response = await specialtyService.deleteSpecialty(id);
        if (response.status) {
          setSuccess('Đã xóa chuyên khoa thành công');
          setSpecialties(specialties.filter(s => s.id !== id));
        } else {
          alert('Lỗi: ' + response.message);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi thực hiện yêu cầu.');
      }
    }
  };

  const handleOpenModal = (specialty: SpecialtyDTO | null = null) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setFormData({
        name: specialty.name,
        description: specialty.description
      });
    } else {
      setEditingSpecialty(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSpecialty) {
        const response = await specialtyService.updateSpecialty(editingSpecialty.id!, formData);
        if (response.status) {
          setSuccess('Cập nhật thông tin chuyên khoa thành công');
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await specialtyService.createSpecialty(formData);
        if (response.status) {
          setSuccess('Thêm chuyên khoa mới thành công');
        } else {
          throw new Error(response.message);
        }
      }
      setIsModalOpen(false);
      fetchSpecialties();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSpecialties = specialties.filter(spec => 
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    spec.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-primary h-8 w-8" />
            Quản lý Chuyên khoa
          </h1>
          <p className="text-gray-500 mt-1">Quản lý danh sách các khoa và phòng ban chuyên môn</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="group relative flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Plus className="h-5 w-5 relative z-10" />
          <span className="font-semibold relative z-10">Thêm chuyên khoa mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng số chuyên khoa</p>
            <p className="text-xl font-bold">{specialties.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Hoạt động</p>
            <p className="text-xl font-bold">{specialties.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Mô tả chi tiết</p>
            <p className="text-xl font-bold">{specialties.filter(s => s.description).length}</p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-green-500 h-5 w-5" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên chuyên khoa hoặc mô tả..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
            <button 
              onClick={fetchSpecialties}
              className="text-primary font-semibold hover:underline"
            >
              Thử tải lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tên chuyên khoa</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSpecialties.map((spec) => (
                  <tr key={spec.id} className="group hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-400">#{spec.id?.toString().padStart(3, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">{spec.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 max-w-md line-clamp-1 truncate" title={spec.description}>
                        {spec.description || 'Chưa có mô tả'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(spec)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(spec.id!)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSpecialties.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-400 font-medium italic">
                          Không tìm thấy dữ liệu nào phù hợp.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpecialty ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới'}
        icon={Building2}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên chuyên khoa</label>
              <input
                type="text"
                required
                placeholder="VD: Khoa Nội tổng quát, Khoa Nhi..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                placeholder="Nhập mô tả về chuyên môn, chức năng của khoa..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all min-h-[120px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                <span>{editingSpecialty ? 'Lưu thay đổi' : 'Xác nhận tạo'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

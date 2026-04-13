import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Package,
  Activity,
  Box
} from 'lucide-react';
import { medicineService, type MedicineDTO } from '../services/medicine.service';
import { Modal } from '../components/Modal';

export const MedicineManagement = () => {
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineDTO | null>(null);
  const [formData, setFormData] = useState<MedicineDTO>({
    name: '',
    unit: '',
    active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (err) {
      setError('Không thể tải danh bản danh mục thuốc. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Show success message temporarily
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại thuốc này khỏi hệ thống? \nLưu ý: Hành động này không thể hoàn tác.`)) {
      try {
        const response = await medicineService.deleteMedicine(id);
        if (response.status) {
          setSuccess('Đã xóa thuốc thành công');
          setMedicines(medicines.filter(m => m.id !== id));
        } else {
          alert('Lỗi: ' + response.message);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi thực hiện yêu cầu.');
      }
    }
  };

  const handleOpenModal = (medicine: MedicineDTO | null = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        unit: medicine.unit,
        active: medicine.active
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        unit: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMedicine) {
        const response = await medicineService.updateMedicine(editingMedicine.id!, formData);
        if (response.status) {
          setSuccess('Cập nhật thông tin thuốc thành công');
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await medicineService.createMedicine(formData);
        if (response.status) {
          setSuccess('Thêm thuốc mới thành công');
        } else {
          throw new Error(response.message);
        }
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Package className="text-primary h-8 w-8" />
            Quản lý Danh mục Thuốc
          </h1>
          <p className="text-gray-500 mt-1">Cập nhật và quản lý kho dược phẩm của bệnh viện</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="group relative flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Plus className="h-5 w-5 relative z-10" />
          <span className="font-semibold relative z-10">Thêm thuốc mới</span>
        </button>
      </div>

      {/* Stats Cards (Visual only for now) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng số thuốc</p>
            <p className="text-xl font-bold">{medicines.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-xl font-bold">{medicines.filter(m => m.active).length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đơn vị sử dụng</p>
            <p className="text-xl font-bold">{new Set(medicines.map(m => m.unit)).size}</p>
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

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên thuốc hoặc đơn vị tính..."
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
            <p className="text-gray-500 font-medium animate-pulse">Đang tải thuốc phẩm...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
            <div className="bg-red-50 p-4 rounded-full text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <p className="text-red-600 max-w-xs">{error}</p>
            <button
              onClick={fetchMedicines}
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
                  <th className="px-6 py-4">Tên thuốc</th>
                  <th className="px-6 py-4">Đơn vị tính</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="group hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-400">#{med.id?.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <Box className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">{med.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        {med.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {med.active ? (
                        <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          Đang dùng
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 font-semibold text-sm">
                          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                          Ngưng dùng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(med)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id!)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Box className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-400 font-medium whitespace-pre-wrap">
                          Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchTerm}"
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
        title={editingMedicine ? 'Cập nhật thông tin thuốc' : 'Thêm thuốc mới'}
        icon={Box}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên thuốc (Biệt dược/Hoạt chất)</label>
              <input
                type="text"
                required
                placeholder="VD: Paracetamol 500mg"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Đơn vị tính</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                <option value="">Chọn đơn vị...</option>
                <option value="Viên">Viên</option>
                <option value="Vỉ">Vỉ</option>
                <option value="Hộp">Hộp</option>
                <option value="Chai/Lọ">Chai/Lọ</option>
                <option value="Ống">Ống</option>
                <option value="Gói">Gói</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-800">Trạng thái kinh doanh</label>
                <p className="text-xs text-gray-500">Cho phép kê đơn nếu đang hoạt động</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.active ? 'bg-primary' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
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
                <span>{editingMedicine ? 'Lưu thay đổi' : 'Xác nhận tạo'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

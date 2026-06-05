import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, Users } from 'lucide-react';
import { adminService, type AccountResponse, type AccountRequest } from '../services/admin.service';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { Modal } from '../components/Modal';

export const UserManagement = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(null);
  const [formData, setFormData] = useState<AccountRequest>({
    fullName: '',
    phone: '',
    password: '',
    role: 'STAFF',
    specialtyId: undefined,
    degree: '',
    startWorkingDate: ''
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    const fetchSpecialties = async () => {
      try {
        const data = await specialtyService.getAllSpecialties();
        setSpecialties(data);
      } catch (err) {
        console.error('Không thể tải chuyên khoa', err);
      }
    };
    fetchSpecialties();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await adminService.deleteAccount(id);
        setAccounts(accounts.filter(acc => acc.id !== id));
      } catch (err) {
        alert('Xóa thất bại');
      }
    }
  };

  const handleOpenModal = (account: AccountResponse | null = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        fullName: account.fullName,
        phone: account.phone,
        role: account.role,
        password: '',
        specialtyId: account.role === 'DOCTOR' ? account.specialtyId : undefined,
        degree: account.role === 'DOCTOR' ? (account.degree || '') : '',
        startWorkingDate: account.role === 'DOCTOR' ? (account.startWorkingDate || '') : ''
      });
    } else {
      setEditingAccount(null);
      setFormData({
        fullName: '',
        phone: '',
        password: '',
        role: 'STAFF',
        specialtyId: undefined,
        degree: '',
        startWorkingDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await adminService.updateAccount(editingAccount.id, formData);
      } else {
        await adminService.createAccount(formData);
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert('Thao tác thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">Quản lý danh sách bác sĩ, nhân viên và người dùng hệ thống</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="STAFF">Nhân viên</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Họ tên</th>
                  <th className="px-6 py-3">Số điện thoại</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{acc.fullName}</td>
                    <td className="px-6 py-4">{acc.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${acc.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        acc.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                          acc.role === 'STAFF' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {acc.role}
                      </span>
                      {acc.role === 'DOCTOR' && acc.specialtyId && (
                        <span className="block text-[10px] text-gray-500 mt-1">
                          ({specialties.find(s => s.id === acc.specialtyId)?.name || 'N/A'})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button
                          onClick={() => handleOpenModal(acc)}
                          className="hover:text-primary transition-colors p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="hover:text-red-500 transition-colors p-1"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy tài khoản nào phù hợp.
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
        title={editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        icon={Users}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu {editingAccount && <span className="text-xs text-gray-400 ms-1">(Để trống nếu không đổi)</span>}
            </label>
            <input
              type="password"
              required={!editingAccount}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.role}
              onChange={(e) => setFormData({ 
                ...formData, 
                role: e.target.value, 
                specialtyId: e.target.value === 'DOCTOR' ? formData.specialtyId : undefined,
                degree: e.target.value === 'DOCTOR' ? formData.degree : '',
                startWorkingDate: e.target.value === 'DOCTOR' ? formData.startWorkingDate : ''
              })}
            >
              <option value="DOCTOR">Bác sĩ</option>
              <option value="STAFF">Nhân viên</option>
            </select>
          </div>

          {formData.role === 'DOCTOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên khoa</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.specialtyId || ''}
                onChange={(e) => setFormData({ ...formData, specialtyId: Number(e.target.value) })}
              >
                <option value="">Chọn chuyên khoa...</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {formData.role === 'DOCTOR' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học vị</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thạc sĩ, Tiến sĩ..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.startWorkingDate}
                  onChange={(e) => setFormData({ ...formData, startWorkingDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
            >
              {editingAccount ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

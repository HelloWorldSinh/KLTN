import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, UserCircle, Save, Briefcase, GraduationCap } from 'lucide-react';
import { userService, type UserProfile } from '../services/user.service';
import { specialtyService, type SpecialtyDTO } from '../services/specialty.service';
import { toast } from 'react-hot-toast';

export const UserProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, specialtiesData] = await Promise.all([
        userService.getProfile(),
        specialtyService.getAllSpecialties()
      ]);
      setProfile(profileData);
      setSpecialties(specialtiesData);
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      await userService.updateProfile({
        fullName: profile.fullName,
        email: profile.email,
        dob: profile.dob,
        gender: profile.gender,
        address: profile.address,
        specialtyId: profile.specialtyId,
        degree: profile.degree,
        startWorkingDate: profile.startWorkingDate
      });
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <UserCircle className="text-primary h-8 w-8" />
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-500 mt-1">Cập nhật thông tin tài khoản, liên hệ và chuyên môn của bạn.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        {/* Profile Summary Badge */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-primary/15 shrink-0">
            {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{profile?.fullName}</h2>
            <span className="inline-block mt-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              {profile?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={profile?.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={profile?.email || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số điện thoại (Cố định)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={profile?.phone || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    name="dob"
                    value={profile?.dob || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Giới tính</label>
                <select
                  name="gender"
                  value={profile?.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea
                    name="address"
                    value={profile?.address || ''}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Doctor specific fields (Only for DOCTOR role) */}
          {profile?.role === 'DOCTOR' && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Thông tin chuyên môn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Chuyên khoa</label>
                  <select
                    name="specialtyId"
                    value={profile?.specialtyId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm"
                  >
                    <option value="">Chọn chuyên khoa</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Học vị / Bằng cấp</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="degree"
                      value={profile?.degree || ''}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Thạc sĩ, Bác sĩ CKI..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ngày bắt đầu làm việc</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      name="startWorkingDate"
                      value={profile?.startWorkingDate || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
            >
              <Save size={18} />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

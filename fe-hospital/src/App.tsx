import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { MedicineManagement } from './pages/MedicineManagement';
import { SpecialtyManagement } from './pages/SpecialtyManagement';
import { ScheduleManagement } from './pages/ScheduleManagement';
import { UserProfilePage } from './pages/UserProfilePage';
import { PatientBooking } from './pages/PatientBooking';
import { MyAppointments } from './pages/MyAppointments';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { ExaminationPage } from './pages/ExaminationPage';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';

// Mock empty pages for routing structure
const MockPage = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500">Trang này đang trong quá trình phát triển (Chờ triển khai các chức năng liên quan).</p>
  </div>
);

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getHomeNavigate = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'DOCTOR': return '/doctor/patients';
      case 'STAFF': return '/staff/appointments';
      case 'PATIENT': return '/patient/dashboard';
      default: return '/login';
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="dashboard" element={<MockPage title="Bảng thống kê Admin" />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="specialties" element={<SpecialtyManagement />} />
              <Route path="schedules" element={<ScheduleManagement />} />
              <Route path="medicines" element={<MedicineManagement />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
              <Route path="patients" element={<DoctorAppointments />} />
              <Route path="examination/:appointmentId" element={<ExaminationPage />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="diagnosis" element={<MockPage title="Chẩn đoán & Đơn thuốc" />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="appointments" element={<MockPage title="Tất cả lịch hẹn" />} />
              <Route path="confirmations" element={<MockPage title="Xác nhận lịch hẹn" />} />
            </Route>

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route path="dashboard" element={<MockPage title="Tổng quan Bệnh nhân" />} />
              <Route path="book" element={<PatientBooking />} />
              <Route path="schedule" element={<MyAppointments />} />
              <Route path="history" element={<MockPage title="Lịch sử khám bệnh" />} />
              <Route path="doctors" element={<MockPage title="Tìm kiếm bác sĩ" />} />
            </Route>

            {/* Common Profile Route */}
            <Route path="/profile" element={<UserProfilePage />} />

            <Route path="/" element={<Navigate to={getHomeNavigate()} replace />} />
          </Route>
        </Route>
        
        <Route path="/unauthorized" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Truy cập không hợp lệ</h1><p className="mt-2 text-gray-600">Bạn không có quyền xem trang này.</p></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

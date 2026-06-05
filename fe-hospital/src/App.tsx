import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { MedicineManagement } from './pages/MedicineManagement';
import { SpecialtyManagement } from './pages/SpecialtyManagement';
import { ScheduleManagement } from './pages/ScheduleManagement';
import { UserProfilePage } from './pages/UserProfilePage';
import { PatientBooking } from './pages/PatientBooking';
import { PatientDashboard } from './pages/PatientDashboard';
import { MyAppointments } from './pages/MyAppointments';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { ExaminationPage } from './pages/ExaminationPage';
import { PatientQueue } from './pages/PatientQueue';
import { DoctorQueue } from './pages/DoctorQueue';
import { StaffQueue } from './pages/StaffQueue';
import { useAuthStore } from './store/authStore';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { useEffect } from 'react';
import { Home } from './pages/Home';
import { X } from 'lucide-react';
import { useSSE } from './hooks/useSSE';

// Mock empty pages for routing structure
const MockPage = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500">Trang này đang trong quá trình phát triển (Chờ triển khai các chức năng liên quan).</p>
  </div>
);

const App = () => {
  const { logout, token, isAuthenticated } = useAuthStore();

  // Kết nối SSE toàn cục để nhận thông báo thời gian thực (ví dụ: thông báo hủy lịch)
  useSSE({
    url: isAuthenticated && token ? `http://localhost:1111/sse/connect?token=${token}` : '',
    enabled: isAuthenticated && !!token,
    eventListeners: {
      notification: (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.error(`${data.title}: ${data.content}`, {
            duration: 10000 // Giữ thông báo trong 10 giây
          });
          // Phát sự kiện custom thông báo cho các component khác (như Header) cập nhật
          window.dispatchEvent(new Event('new-notification'));
        } catch (err) {
          console.error('Lỗi phân tích thông báo SSE:', err);
        }
      }
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized-api-call', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized-api-call', handleUnauthorized);
    };
  }, [logout]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 8000, // Keep toast visible for 8 seconds
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 shrink-0 ml-2 cursor-pointer"
                    title="Đóng"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="specialties" element={<SpecialtyManagement />} />
              <Route path="schedules" element={<ScheduleManagement />} />
              <Route path="medicines" element={<MedicineManagement />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
              <Route path="patients" element={<DoctorAppointments />} />
              <Route path="queue" element={<DoctorQueue />} />
              <Route path="examination/:appointmentId" element={<ExaminationPage />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="diagnosis" element={<MockPage title="Chẩn đoán & Đơn thuốc" />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="appointments" element={<StaffQueue />} />
              <Route path="confirmations" element={<MockPage title="Xác nhận lịch hẹn" />} />
            </Route>

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<PatientBooking />} />
              <Route path="schedule" element={<MyAppointments />} />
              <Route path="queue" element={<PatientQueue />} />
              <Route path="history" element={<MockPage title="Lịch sử khám bệnh" />} />
              <Route path="doctors" element={<Navigate to="/patient/book" replace />} />
            </Route>

            {/* Common Profile Route */}
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>
        </Route>
        
        <Route path="/unauthorized" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Truy cập không hợp lệ</h1><p className="mt-2 text-gray-600">Bạn không có quyền xem trang này.</p></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

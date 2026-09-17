import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ======================
// VERCEL APP ROLE
// ======================

const APP_ROLE = import.meta.env.VITE_APP_ROLE || "ADMIN";

const DEFAULT_LOGIN =
  APP_ROLE === "SUB_ADMIN"
    ? "/login/sub-admin"
    : APP_ROLE === "MANAGER"
    ? "/login/manager"
    : "/login/admin";

// ======================
// LOGIN
// ======================

import AdminLogin from "./pages/auth/AdminLogin";
import SubAdminLogin from "./pages/auth/SubAdminLogin";
import ManagerLogin from "./pages/auth/ManagerLogin";

// ======================
// AUTH
// ======================

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

// ======================
// MANAGER
// ======================

import ManagerDashboard from "./pages/manager/Dashboard";
import CustomerId from "./pages/manager/CustomerId";
import VerifyEdit from "./pages/manager/VerifyEdit";
import RegisterPhoto from "./pages/manager/RegisterPhoto";

// ======================
// SUB ADMIN
// ======================

import SubAdminDashboard from "./pages/subAdmin/Dashboard";
import CreateManager from "./pages/subAdmin/CreateManager";
import ManagerList from "./pages/subAdmin/ManagerList";
import CustomerPhotos from "./pages/subAdmin/CustomerPhotos";
import RegisterPhotos from "./pages/subAdmin/RegisterPhotos";

// ======================
// MAIN ADMIN
// ======================

import MainAdminDashboard from "./pages/mainAdmin/Dashboard";
import CreateSubAdmin from "./pages/mainAdmin/CreateSubAdmin";
import SubAdminList from "./pages/mainAdmin/SubAdminList";
import AllManagers from "./pages/mainAdmin/AllManagers";
import AllCustomerPhotos from "./pages/mainAdmin/AllCustomerPhotos";
import AllRegisterPhotos from "./pages/mainAdmin/AllRegisterPhotos";

function App() {
  return (
    <Routes>

      {/* ==================================
          DEFAULT
      ================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to={DEFAULT_LOGIN}
            replace
          />
        }
      />

      {/* ==================================
          LOGIN ROUTES
      ================================== */}

      <Route
        path="/login"
        element={
          <Navigate
            to={DEFAULT_LOGIN}
            replace
          />
        }
      />

      <Route
        path="/login/admin"
        element={<AdminLogin />}
      />

      <Route
        path="/login/sub-admin"
        element={<SubAdminLogin />}
      />

      <Route
        path="/login/manager"
        element={<ManagerLogin />}
      />

      {/* ==================================
          MANAGER ROUTES
      ================================== */}

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MANAGER">
              <ManagerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/customer-id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MANAGER">
              <CustomerId />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/verify-edit/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MANAGER">
              <VerifyEdit />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/register-photo"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MANAGER">
              <RegisterPhoto />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ==================================
          SUB ADMIN ROUTES
      ================================== */}

      <Route
        path="/sub-admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="SUB_ADMIN">
              <SubAdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sub-admin/create-manager"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="SUB_ADMIN">
              <CreateManager />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sub-admin/managers"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="SUB_ADMIN">
              <ManagerList />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sub-admin/customer-photos"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="SUB_ADMIN">
              <CustomerPhotos />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sub-admin/register-photos"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="SUB_ADMIN">
              <RegisterPhotos />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ==================================
          MAIN ADMIN ROUTES
      ================================== */}

      <Route
        path="/main-admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <MainAdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/main-admin/create-sub-admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <CreateSubAdmin />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/main-admin/sub-admins"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <SubAdminList />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/main-admin/managers"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <AllManagers />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/main-admin/customer-photos"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <AllCustomerPhotos />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/main-admin/register-photos"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="MAIN_ADMIN">
              <AllRegisterPhotos />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ==================================
          UNKNOWN URL
          ================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={DEFAULT_LOGIN}
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;
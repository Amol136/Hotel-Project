import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";

// MANAGER
import ManagerDashboard from "./pages/manager/Dashboard";
import CustomerId from "./pages/manager/CustomerId";
import VerifyEdit from "./pages/manager/VerifyEdit";
import RegisterPhoto from "./pages/manager/RegisterPhoto";

// SUB ADMIN
import SubAdminDashboard from "./pages/subAdmin/Dashboard";
import CreateManager from "./pages/subAdmin/CreateManager";
import ManagerList from "./pages/subAdmin/ManagerList";
import CustomerPhotos from "./pages/subAdmin/CustomerPhotos";
import RegisterPhotos from "./pages/subAdmin/RegisterPhotos";
import MainAdminDashboard from "./pages/mainAdmin/Dashboard";
import CreateSubAdmin from "./pages/mainAdmin/CreateSubAdmin";
import SubAdminList from "./pages/mainAdmin/SubAdminList";
import AllManagers from "./pages/mainAdmin/AllManagers";
import AllCustomerPhotos from "./pages/mainAdmin/AllCustomerPhotos";
import AllRegisterPhotos from "./pages/mainAdmin/AllRegisterPhotos";
function App() {
  return (
    <Routes>

      {/* DEFAULT */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* =========================
          MANAGER ROUTES
      ========================== */}

      <Route
        path="/manager/dashboard"
        element={<ManagerDashboard />}
      />

      <Route
        path="/manager/customer-id"
        element={<CustomerId />}
      />

      <Route
        path="/manager/verify-edit/:id"
        element={<VerifyEdit />}
      />

      <Route
        path="/manager/register-photo"
        element={<RegisterPhoto />}
      />

      {/* =========================
          SUB ADMIN ROUTES
      ========================== */}

      <Route
        path="/sub-admin/dashboard"
        element={<SubAdminDashboard />}
      />

      <Route
        path="/sub-admin/create-manager"
        element={<CreateManager />}
      />

      <Route
        path="/sub-admin/managers"
        element={<ManagerList />}
      />

      <Route
        path="/sub-admin/customer-photos"
        element={<CustomerPhotos />}
      />

      <Route
        path="/sub-admin/register-photos"
        element={<RegisterPhotos />}
      />

      {/* UNKNOWN URL */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
      <Route
  path="/main-admin/dashboard"
  element={<MainAdminDashboard />}
/>
<Route
  path="/main-admin/create-sub-admin"
  element={<CreateSubAdmin />}
/>

<Route
  path="/main-admin/sub-admins"
  element={<SubAdminList />}
/>

<Route
  path="/main-admin/managers"
  element={<AllManagers />}
/>

<Route
  path="/main-admin/customer-photos"
  element={<AllCustomerPhotos />}
/>

<Route
  path="/main-admin/register-photos"
  element={<AllRegisterPhotos />}
/>

    </Routes>
  );
}

export default App;
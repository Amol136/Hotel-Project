import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

function RoleRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "MAIN_ADMIN") {
      return (
        <Navigate
          to="/main-admin/dashboard"
          replace
        />
      );
    }

    if (user.role === "SUB_ADMIN") {
      return (
        <Navigate
          to="/sub-admin/dashboard"
          replace
        />
      );
    }

    if (user.role === "MANAGER") {
      return (
        <Navigate
          to="/manager/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleRoute;
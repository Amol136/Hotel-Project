import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

function RoleRoute({
  children,
  allowedRole,
}) {
  const { user } = useAuth();

  if (!user) {
    if (allowedRole === "MANAGER") {
      return (
        <Navigate
          to="/login/manager"
          replace
        />
      );
    }

    if (allowedRole === "SUB_ADMIN") {
      return (
        <Navigate
          to="/login/sub-admin"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login/admin"
        replace
      />
    );
  }

  // Wrong role असल्यास त्याच्या स्वतःच्या dashboard वर पाठवा
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

    return (
      <Navigate
        to="/login/admin"
        replace
      />
    );
  }

  return children;
}

export default RoleRoute;
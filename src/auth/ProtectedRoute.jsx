import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // URL वरून कोणता login page उघडायचा ते ठरवा
    if (location.pathname.startsWith("/manager")) {
      return (
        <Navigate
          to="/login/manager"
          replace
        />
      );
    }

    if (location.pathname.startsWith("/sub-admin")) {
      return (
        <Navigate
          to="/login/sub-admin"
          replace
        />
      );
    }

    if (location.pathname.startsWith("/main-admin")) {
      return (
        <Navigate
          to="/login/admin"
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

export default ProtectedRoute;
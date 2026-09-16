import { useState } from "react";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("loggedInUser");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const login = (userData) => {
    setUser(userData);

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(userData)
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
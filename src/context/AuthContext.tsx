/* eslint-disable no-useless-catch */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { AuthContextType, User } from "../models/User";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../service/authService";
import { notification } from "antd";

const AuthContext1 = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("user"); // Sử dụng sessionStorage
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = useCallback(
    (token: string, userData: User) => {
      localStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await userLogout();
      setUser(null);
      navigate("/login", { replace: true });
      notification.success({
        message: "Logout Successful",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      notification.error({
        message: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  }, [navigate]);

  const getRole = () => {
    return user?.role || null;
  };

  return (
    <AuthContext1.Provider value={{ user, login, logout, setUser, getRole }}>
      {children}
    </AuthContext1.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext1);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthContext1, AuthProvider, useAuth };

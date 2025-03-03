/* eslint-disable no-useless-catch */
import { createContext, ReactNode, useContext, useState } from "react";
import { AuthContextType, User } from "../models/User";
import { authServiceLogin, getCurrentUser } from "../service/authService";

const AuthContext1 = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("user"); // Sử dụng sessionStorage
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const token = await authServiceLogin(email, password);
      sessionStorage.setItem("accessToken", token);

      const userData = await getCurrentUser(token);
      console.log("User data before setting:", userData);
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  // const logout = async () => {
  //   await authServiceLogout();
  //   message.success("You have been logged out!");
  //   setUser(null);
  //   sessionStorage.removeItem("user"); // Xóa user khỏi sessionStorage
  // };

  const getRole = () => {
    return user?.role || null;
  };

  return (
    <AuthContext1.Provider value={{ user, login, setUser, getRole }}>
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

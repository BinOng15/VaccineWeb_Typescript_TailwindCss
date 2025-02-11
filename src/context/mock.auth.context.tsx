import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  auth: {
    isAuthenticated: boolean;
    user?: { name: string; role: string };
  };
  setAuth: React.Dispatch<React.SetStateAction<AuthContextType["auth"]>>;
}

const MockAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong MockAuthProvider");
  }
  return context;
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthContextType["auth"]>({
    isAuthenticated: false, // Mặc định chưa đăng nhập
  });

  return (
    <MockAuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </MockAuthContext.Provider>
  );
};

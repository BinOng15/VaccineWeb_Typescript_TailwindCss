import { APILink } from "../components/Const/ApiLink";
import { User } from "../models/User";
import { axiosInstance } from "./axiosInstance";

/* eslint-disable @typescript-eslint/no-explicit-any */
const handleAuthError = (error: any) => {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return error.message;
  };

  export const authServiceLogin = async (email: string, password: string): Promise<string> => {
    try {
      const response = await axiosInstance.post("api/auth/login", { email, password });
      const token = response.data.token || response.data.accessToken || response.data.data?.token;
      if (token) {
        sessionStorage.setItem("accessToken", token);
        return token;
      }
      throw new Error("Token not found in response!");
    } catch (error) {
      throw new Error(handleAuthError(error));
    }
  };

  export const getCurrentUser = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${APILink}/api/User/current-user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }
      const data = await response.json();
      const user: User = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: "", // Giá trị mặc định
        address: "", // Giá trị mặc định
        role: data.role, // Giá trị mặc định nếu data.role không tồn tại
        dateOfBirth: "", // Giá trị mặc định
        isActive: "Active", // Giá trị mặc định
        createdDate: "", // Giá trị mặc định
        createdBy: "system", // Giá trị mặc định
        modifiedDate: "", // Giá trị mặc định
        modifiedBy: "system", // Giá trị mặc định
      };
      return user;
    } catch (error) {
      console.error("Error in getCurrentLogin:", error);
      return null;
    }
  };

  // export const authServiceLogout = async (): Promise<void> => {
  //   try {
  //     const token = sessionStorage.getItem("token");
  //     if (!token) throw new Error("Token not found!");
  
  //     await axiosInstance.get("/api/auth/logout", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  
  //     sessionStorage.removeItem("user");
  //     sessionStorage.removeItem("token");
  //     sessionStorage.removeItem("userRole");
  //   } catch (error) {
  //     throw new Error(handleAuthError(error));
  //   }
  // };
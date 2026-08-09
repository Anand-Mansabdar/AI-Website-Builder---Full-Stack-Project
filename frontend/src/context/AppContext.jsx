import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    try {
      const data = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Login Successful");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "Invalid email or password";
      toast.error(errorMessage);
      console.log("Login failed:", error);
    }
  };

  const register = async (userName, email, password) => {
    try {
      const data = await api.post("/api/auth/register", {
        userName,
        email,
        password,
      });
      setUser(data.user);
      toast.success("User Registered Successfully");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "Failed to register user";
      toast.error(errorMessage);
      console.log("Registration failed:", error);
      throw new Error(errorMessage);
    }
  };

  return (
    <AppContext.Provider value={{ user, loadingUser, login, register }}>
      {children}
    </AppContext.Provider>
  );
}

export function UseAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

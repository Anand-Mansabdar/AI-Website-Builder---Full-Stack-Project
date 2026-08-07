import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      // setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <AppContext.Provider value={{ user, loadingUser }}>
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

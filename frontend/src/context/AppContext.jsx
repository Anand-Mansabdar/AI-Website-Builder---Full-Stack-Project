import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingProject, setGeneratingProject] = useState(false);
  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

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

  const normalizeUser = (user) => ({
    ...user,
    userName: user?.userName || user?.name || "",
  });

  const login = async (email, password) => {
    try {
      const data = await api.post("/api/auth/login", { email, password });
      setUser(normalizeUser(data.user));
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
      setUser(normalizeUser(data.user));
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

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const loadProjects = useCallback(async () => {
    if (!user) {
      setLoadingProjects(false);
      return;
    }
    try {
      const data = await api.get("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects.", error);
      toast.error("Failed to fetch projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const loadProject = async (id, silent = false) => {
    if (!user) return;
    if (!silent) setLoadingActiveProject(true);
    try {
      const { data } = await api.get(`/api/projects/${id}`);
      setActiveProject(data);

      const files = Object.keys(data.files);
      if (files.length > 0) {
        setActiveFile((prev) => {
          if (files.includes(prev)) return prev;
          if (files.includes("/App.js")) return "/App.js";
          return files[0];
        });
      }
    } catch (error) {
      console.error("Failed to load project.", error);
      if (!silent) {
        toast.error("Failed to load project.");
        navigate("/");
      }
    } finally {
      if (!silent) setLoadingActiveProject(false);
    }
  };

  useEffect(() => {
    if (!activeProject?._id || user) return;

    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending" ||
      activeProject.status === "revising";

    if (isOngoing) {
      setChatLoading(true);
      const interval = setInterval(() => {
        loadProject(activeProject._id, true);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setChatLoading(false);
    }
  }, [activeProject?._id, activeProject?.status, loadProject, user]);

  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;
      setGeneratingProject(true);
      try {
        const { data } = await api.post("/api/projects", { prompt });
        toast.success("Planning Structure");
        navigate(`/builder/${data._id}`);
      } catch (error) {
        console.error("Failed to generate project:", error);
        toast.error(
          error?.response?.data?.error || "Failed to generate project",
        );
      } finally {
        setGeneratingProject(false);
      }
    },
    [navigate, user],
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await api.delete(`/api/projects/${id}`);
        setProjects((prev) => prev.filter((project) => prev._id !== id));
        toast.success("Project Deleted");
      } catch (error) {
        console.error("Failed to delete project:", error);
        toast.error("Failed to delete project");
      }
    },
    [user],
  );

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        login,
        register,
        logout,
        handleDelete,
        handleGenerate,
        projects,
        loadProject,
        loadingProjects,
        activeProject,
        generatingProject,
        chatLoading,
        showCode,
        setActiveFile,
        setShowCode,
        loadProjects,
        loadingActiveProject,
        activeFile,
      }}
    >
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

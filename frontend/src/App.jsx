import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthLayout, GuestLayout } from "./pages/Layout";
import AuthenticationPage from "./pages/AuthenticationPage";
import HomePage from "./pages/HomePage";
import BuilderPage from "./pages/BuilderPage";
import Preview from "./pages/Preview";
import { Toaster } from "react-hot-toast";
import Publish from "./pages/Publish";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<AuthenticationPage mode="login" />} />
          <Route
            path="/register"
            element={<AuthenticationPage mode="register" />}
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
          <Route path="/preview/:id" element={<Preview />} />
        </Route>

        {/* Public Routes */}
        <Route path="/publish/:id" element={<Publish />} />

        <Route path="*" element={<Navigate to={"/"} replace />}></Route>
      </Routes>
    </>
  );
};

export default App;

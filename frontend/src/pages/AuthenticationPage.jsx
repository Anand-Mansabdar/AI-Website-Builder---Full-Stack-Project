import React, { useState } from "react";
import LoginLeft from "../components/LoginLeft";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { UseAppContext } from "../context/AppContext";

const AuthenticationPage = ({ mode }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isLoggingIn = mode === "login";

  const { login, register } = UseAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(userName, email, password);
      }

      navigate("/");
    } catch (error) {
      setError(
        error.message ||
          (mode === "login"
            ? "Invalid Email or Password"
            : "Registration Failed."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex text-zinc-900 font-sans">
      {/* Left Login Page */}
      <LoginLeft />

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-1.5 font-sans">
              {isLoggingIn ? "Sign In" : "Register"}
            </h1>

            <p className="text-sm text-stone-400">
              {isLoggingIn
                ? "Sign in using Email and Password"
                : "New User? Create an account"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 border border-red-300 bg-red-50 text-rose-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoggingIn && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full pl-2 py-2 border-b border-zinc-300 focus:outline-none focus:border-neutral-950 text-sm text-stone-900 bg-transparent placeholder-stone-400 transition-colors"
                  placeholder="Enter your full name., eg. Alex Hales"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-2 py-2 border-b border-zinc-300 focus:outline-none focus:border-neutral-950 text-sm text-stone-900 bg-transparent placeholder-stone-400 transition-colors"
                placeholder="Enter your email., eg. example@gmail.com"
              />
            </div>
            <div className="">
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-2 py-2 border-b border-zinc-300 focus:outline-none focus:border-neutral-950 text-lg text-stone-900 bg-transparent placeholder-stone-400  placeholder:text-sm transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-7 -translate-y-1/2 text-zinc-300 hover:text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon size={14} />
                  ) : (
                    <EyeIcon size={14} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-linear-to-br from-rose-600 to-amber-600 text-white font-semibold hover:scale-100 disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-all"
            >
              {loading && (
                <Loader2Icon className="animate-spin h-3.5 w-3.5 mr-2" />
              )}
              {isLoggingIn ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-stone-400 mt-6 pt-6 border-t border-zinc-300 font-sans">
            {isLoggingIn ? (
              <>
                New to BuilderAI ?{" "}
                <Link
                  to={"/register"}
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Create an account
                </Link>{" "}
              </>
            ) : (
              <>
                Existing User?{" "}
                <Link
                  to={"/login"}
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Sign In
                </Link>{" "}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;

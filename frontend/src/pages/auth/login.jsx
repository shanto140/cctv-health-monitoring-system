import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanEye, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { loginUser } from "../../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    setResetNotice(true);
    // Password reset backend not implemented yet — UI placeholder only.
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      const user = data;
      if (!user) {
        throw new Error("User not found in response");
      }

      console.log(user);
      console.log(data);

      if (user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/technician/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ backgroundColor: "#0A0E14", color: "#E7ECF3" }}
      className="min-h-screen w-full flex items-center justify-center px-6"
    >
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ScanEye size={24} color="#22D3EE" strokeWidth={2} />
          <span className="text-xl tracking-wide font-semibold">CamGuard</span>
        </div>

        <div className="rounded-lg border p-8" style={{ borderColor: "#1E2A3F", backgroundColor: "#121826" }}>
          <h1 className="text-2xl font-semibold mb-1">Log in</h1>
          <p className="text-sm mb-7" style={{ color: "#8B98AC" }}>
            Admin and technician accounts only.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* email */}
            <div>
              <label htmlFor="email" className="text-xs uppercase tracking-wide block mb-2" style={{ color: "#8B98AC" }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} color="#8B98AC" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full border rounded-lg pl-10 pr-3 py-2.5 text-sm bg-transparent border-[#1E2A3F] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
                  style={{ color: "#E7ECF3" }}
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="text-xs uppercase tracking-wide block mb-2" style={{ color: "#8B98AC" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} color="#8B98AC" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm bg-transparent border-[#1E2A3F] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/20 transition-colors"
                  style={{ color: "#E7ECF3" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#8B98AC" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {resetNotice && (
              <p className="text-xs" style={{ color: "#8B98AC" }}>
                Password reset isn't available yet. Please contact an admin for help.
              </p>
            )}

            {error && (
              <p className="text-xs" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="text-sm px-5 py-3 rounded flex items-center justify-center gap-2 font-medium disabled:opacity-80 transition-opacity"
              style={{ backgroundColor: "#22D3EE", color: "#0A0E14" }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs hover:underline"
              style={{ color: "#22D3EE" }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "#8B98AC" }}>
          Don't have an account? Technician accounts are created by an admin.
        </p>
      </div>
    </div>
  );
}
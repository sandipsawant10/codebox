import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Code2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email) e.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const inp = (field) =>
    `w-full bg-gray-800 border ${errors[field] ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CodeBox</h1>
          <p className="text-gray-400 text-sm mt-1">Create your free account</p>
        </div>
        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Create account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ["name", "Name", "Your name", "text"],
              ["email", "Email", "you@example.com", "email"],
              ["password", "Password", "Min. 6 characters", "password"],
            ].map(([field, label, ph, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {label}
                </label>
                <input
                  className={inp(field)}
                  type={type}
                  placeholder={ph}
                  value={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                />
                {errors[field] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm mt-2"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

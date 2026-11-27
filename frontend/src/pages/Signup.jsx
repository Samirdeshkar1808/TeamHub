import { useState } from "react";
import api from "../services/axiosApi";
import { Link, useNavigate } from "react-router-dom";
import { Users, Eye, EyeOff, Mail, LockKeyhole, UserRound, LoaderCircle, ArrowRight, CheckCircle2} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({name: "", email: "", password: "", confirmPassword: ""});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const {name,value} = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event){
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if(!name || !email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if(name.length > 50) {
      setError("Name must be 50 characters or fewer.");
      return;
    }

    if(form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("auth/signup", {name, email,password: form.password });
      const result = response.data;

      // Supports common backend response formats.
      const token = result.token || result.data?.token || result.accessToken;
      const user = result.user || result.data?.user;

      // Only redirect directly when a JWT is actually returned.
      if(!token){
        setError(
          "Your account may have been created, but no login token was returned. Please login to continue."
        );
        navigate("/login", { replace: true });
        return;
      }

      localStorage.setItem("token", token);

      if(user){
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard", { replace: true });
    }
    catch(err){
      if(err.response){
        setError(err.response.data?.message || err.response.data?.error || "Unable to create your account. Please try again.");
      }
      else if(err.request){
        setError(
          "Cannot connect to the server."
        );
      }
      else{
        setError("Something went wrong. Please try again.");
      }
    }
    finally{
      setLoading(false);
    }
  }

  return (

    <main className="flex min-h-screen bg-white">
      {/* Left panel */}
      <section className="hidden w-1/2 flex-col justify-between border-r border-slate-200 bg-slate-50/70 p-12 lg:flex xl:p-16">
        <Link to="/login" className="flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Users size={24} strokeWidth={2.4} />
          </span>

          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Team<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <div className="max-w-lg">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            Get started with TeamHub
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 xl:text-5xl">
            Bring your team together with{" "}
            <span className="text-blue-600">less friction.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
            Create your account to organize teams, manage tasks, and
            coordinate work across your organization.
          </p>

          <div className="mt-9 space-y-4">
            {["Create and manage organizations", "Assign tasks and track progress", "Coordinate requests across teams"]
             .map((item)=>(
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <CheckCircle2 size={15} />
                </span>

                <span className="text-sm text-slate-600">{item}</span>
              </div>
             ))
            }
          </div>
        </div>

        <p className="text-xs text-slate-400">
          TeamHub · A simpler way to work together
        </p>
      </section>

      {/* Signup form */}
      <section className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <Link
            to="/login"
            className="mb-8 flex w-fit items-center gap-2.5 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Users size={22} />
            </span>

            <span className="text-xl font-bold tracking-tight text-gray-900">
             Team<span className="text-indigo-600">Hub</span>
            </span>
          </Link>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Get started by creating your TeamHub account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Login 
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            TeamHub · A simpler way to work together
          </p>
        </div>
      </section>
    </main>
  );
}

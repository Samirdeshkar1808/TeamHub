import { useState } from "react";
import api from "../services/axiosApi";
import { Link, useNavigate } from "react-router-dom";
import {Users,Eye,EyeOff,Mail,LockKeyhole,LoaderCircle,ArrowRight} from "lucide-react";



export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({email: "",password: ""});

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try{
      setLoading(true);

      const response = await api.post("/auth/login", {email,password: form.password});
      const result = response.data;

      const token = result.token ;
      const user = result.user ;

      if(!token) {
        setError(
          "Login response did not contain a JWT token."
        );
        return;
      }

      localStorage.setItem("token", token);

      if(user){
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard", {replace: true});
    }
    catch(err){
      if (err.response) {
        setError(err.response.data?.message ||err.response.data?.error || "Login failed. Please check your credentials.");
      }
      else if(err.request){
        setError("Cannot connect to the server.");
      }else{
        setError("Something went wrong. Please try again.");
      }
    }
    finally{
      setLoading(false);
    }
  }


  return(
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
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            Your team's workspace
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 xl:text-5xl">
            Good teamwork starts with{" "}
            <span className="text-blue-600">
              clear communication.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
            Organize your teams, manage tasks, and coordinate work
            across your organization—all in one place.
          </p>

          <div className="mt-9 space-y-4">
            {["Keep your team's tasks organized", "Coordinate requests between teams", "Manage your organizations in one place"]
             .map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <ArrowRight size={14} />
                </span>
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          TeamHub · A simpler way to work together
        </p>
      </section>

      {/* Login form */}
      <section className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-105">
          <Link
            to="/login"
            className="mb-10 flex w-fit items-center gap-2.5 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Users size={22} />
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              TeamHub
            </span>
          </Link>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to access your TeamHub workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                    onChange={handleChange} required
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  placeholder="Enter your password" value={form.password} onChange={handleChange} required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                 {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )
                 }

                </button>

              </div>
            </div>

            {error && (
              <div role="alert" 
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-10 text-center text-xs leading-5 text-slate-400">
            TeamHub · A simpler way to work together
          </p>
        </div>
      </section>
    </main>
  );
}


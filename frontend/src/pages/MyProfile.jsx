import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Loader2,
  AlertCircle,
  CircleCheck,
  CircleX,
} from "lucide-react";
import api from "../services/axiosApi";

import Sidebar from "../components/Sidebar";

export default function MyProfile() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/profile/userInfo");
        console.log(response);

        const userData = response.data.userInfo;

        setUser(userData);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={30} />
      </div>
    );
  }

  if(error && !user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle size={19} />
          {error}
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-slate-50 text-slate-900">

    <Sidebar/>

    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your personal information and account details.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-28 bg-gradient-to-r from-indigo-600 to-violet-500" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-sm">
              {initials}
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name || "User"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {user?.email || "Email not available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Personal Information
            </h2>
            <p className="text-xs text-gray-500">
              Your registered account information
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <InfoItem
            icon={UserRound}
            label="Full Name"
            value={user?.name}
          />

          <InfoItem
            icon={Mail}
            label="Email Address"
            value={user?.email}
          />
        </div>
      </section>

      {/* Account details */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Account Details
            </h2>
            <p className="text-xs text-gray-500">
              Your account status and information
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Email Verification
            </p>

            {user?.isEmailVerified ? (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CircleCheck size={17} />
                Verified
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <CircleX size={17} />
                Not verified
              </div>
            )}
          </div>

          <InfoItem
            icon={CalendarDays}
            label="Account Created"
            value={formatDate(user?.createdAt)}
          />
        </div>
      </section>

      {/* Security information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-green-50 p-2.5 text-green-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Account Security
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your account is protected using TeamHub authentication.
              Keep your login credentials private and do not share your
              account token with anyone.
            </p>
          </div>
        </div>
      </section>
    </div>
   </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <Icon size={17} className="shrink-0 text-gray-400" />
        <span className="break-all">{value || "Not available"}</span>
      </div>
    </div>
  );
}

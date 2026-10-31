import { useState } from "react";
import { Mail, UserMinus, UserPlus } from "lucide-react";

import api from "../../services/axiosApi"; // Adjust your api import path as needed

export function AddOrganizationMember({ organizationId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post(`/organizations/${organizationId}/members`, {
        email,
        role,
      });
      setSuccessMessage(response.data.message || "Member added successfully!");
      setEmail("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user in organization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Add an organization member</h3>
          <p className="text-xs text-slate-500">Add a user to the organization using their registered email.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>}
      {successMessage && <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs text-green-600">{successMessage}</div>}

      <form onSubmit={handleAddMember} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Member email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add member"}
        </button>
      </form>
    </div>
  );
}

export function RemoveOrganizationMember({ organizationId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRemoveMember = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to remove ${email} from the organization?`)) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Matches the updated backend endpoint taking email in body or payload configuration
      const response = await api.delete(`/organizations/${organizationId}/members`, {
        data: { email },
      });
      setSuccessMessage(response.data.message || "Member removed successfully!");
      setEmail("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error removing Member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <UserMinus size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Remove organization member</h3>
          <p className="text-xs text-slate-500">Remove an existing user from the organization by email.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>}
      {successMessage && <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs text-green-600">{successMessage}</div>}

      <form onSubmit={handleRemoveMember} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Member email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-red-400 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Removing..." : "Remove member"}
        </button>
      </form>
    </div>
  );
}
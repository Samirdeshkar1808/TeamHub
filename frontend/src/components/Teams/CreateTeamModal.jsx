
import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";

function CreateTeamModal({ onClose, onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headUserId, setHeadUserId] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!headUserId.trim()) {
      setError("Enter the user ID of the initial Team Head.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        headUserId: headUserId.trim(),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not create the team."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
        className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="create-team-title"
              className="text-xl font-semibold text-gray-900"
            >
              Create a team
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a team to the selected organization.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="team-name" className="mb-2 block text-sm font-medium text-gray-700">
              Team name
            </label>
            <input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Tech Team"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="team-description" className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="team-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What does this team do?"
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="team-head-id" className="mb-2 block text-sm font-medium text-gray-700">
              Initial Team Head user ID
            </label>
            <input
              id="team-head-id"
              value={headUserId}
              onChange={(event) => setHeadUserId(event.target.value)}
              required
              placeholder="Paste the user's ID"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-2 text-xs leading-5 text-gray-500">
              The selected user must already belong to this organization.
              You can find their ID in the organization member data.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting && <LoaderCircle size={16} className="animate-spin" />}
              {submitting ? "Creating..." : "Create team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTeamModal;

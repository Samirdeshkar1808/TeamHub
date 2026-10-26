import { CircleAlert, XCircle } from "lucide-react";

export default function TaskError({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5"
    >
      <CircleAlert
        size={18}
        className="mt-0.5 shrink-0"
      />

      <span className="flex-1">{message}</span>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0"
      >
        <XCircle size={17} />
      </button>
    </div>
  );
}
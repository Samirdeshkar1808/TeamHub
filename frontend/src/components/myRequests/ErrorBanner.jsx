import { CircleAlert , X } from "lucide-react";

export default function ErrorBanner({ message, onClose }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <CircleAlert size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">{message}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss error">
        <X size={17} />
      </button>
    </div>
  );
}
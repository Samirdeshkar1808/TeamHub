export default function ActionButton({ children, onClick, disabled, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
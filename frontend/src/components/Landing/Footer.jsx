import { Link } from "react-router-dom";
import { Layers3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-8 sm:flex-row sm:items-center">
        <Link to="/" className="flex items-center gap-2">
          <Layers3 size={21} className="text-indigo-600" />
          <span className="font-bold text-gray-900">TeamHub</span>
        </Link>

        <p className="text-sm text-gray-500">
          Bring your teams together. Get work done.
        </p>

        <div className="flex gap-5 text-sm text-gray-600">
          <Link to="/login" className="hover:text-gray-900">Login</Link>
          <Link to="/signup" className="hover:text-gray-900">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
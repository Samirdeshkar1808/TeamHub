import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Layers3 } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Layers3 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Team<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
            How it works
          </a>
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Get Started
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="space-y-1 border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <a
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            How it works
          </a>
          <Link
            to="/login"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="mt-2 block rounded-lg bg-gray-900 px-3 py-2.5 text-center text-sm font-medium text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
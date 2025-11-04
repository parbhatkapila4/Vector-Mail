import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-9xl font-bold text-transparent">
            404
          </h1>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-white">Page Not Found</h2>

        <p className="mb-8 text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex justify-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50">
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </Link>

          <Link href="/features">
            <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20">
              <Search className="h-4 w-4" />
              Explore Features
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

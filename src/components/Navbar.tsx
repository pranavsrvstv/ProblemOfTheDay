"use client";
import { useApp } from "@/context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const { user, logout } = useApp();
  const router = useRouter();
  const path = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user?.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href={user?.role === "teacher" ? "/teacher" : "/student"} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-xl">📚</span>
          <span className="font-bold text-slate-800 tracking-tight">Problem of the Day</span>
        </Link>

        {/* Nav links — teacher only */}
        {user?.role === "teacher" && (
          <div className="flex items-center gap-1">
            <Link href="/teacher" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${path === "/teacher" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              Dashboard
            </Link>
            <Link href="/teacher/create" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${path === "/teacher/create" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              + New Problem
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user?.role === "student" && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-orange-500 font-semibold">🔥 {user.streak}</span>
              <span className="flex items-center gap-1 text-slate-600">⭐ <span className="font-bold text-slate-800">{user.points}</span> <span className="text-slate-400 font-normal">pts</span></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Logout</button>
          </div>
        </div>

      </div>
    </nav>
  );
}

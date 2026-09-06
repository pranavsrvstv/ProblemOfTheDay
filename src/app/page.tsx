"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      // check localStorage directly for fast redirect
      const saved = localStorage.getItem("potd_user");
      if (saved) {
        const u = JSON.parse(saved);
        router.replace(u.role === "teacher" ? "/teacher" : "/student");
      } else {
        router.replace("/login");
      }
    } else {
      router.replace(user.role === "teacher" ? "/teacher" : "/student");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 text-sm">Loading…</div>
    </div>
  );
}

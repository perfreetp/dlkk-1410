import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

interface Props {
  children?: ReactNode;
}

export default function AppLayout({ children }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main className={`page-content transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

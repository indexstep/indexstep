"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "./Button";
import { Menu, X, User, LogOut, Settings, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ backgroundColor: "var(--navbar-bg)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="indexstep" className="w-12 h-12 object-contain" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: "var(--text)" }}>indexstep</span>
              <span 
                className="rounded font-bold uppercase"
                style={{ 
                  fontFamily: "'Press Start 2P', monospace",
                  backgroundColor: "var(--orange)",
                  color: "#0f0f14",
                  fontSize: "8px",
                  padding: "3px 6px",
                  letterSpacing: "0.5px",
                  lineHeight: "1",
                  display: "inline-block",
                }}
              >
                BETA
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                <Link href="/create" className="hover:opacity-80 transition-colors" style={{ color: "var(--text-secondary)" }}>
                  Create Guide
                </Link>
                <Link href="/profile" className="hover:opacity-80 transition-colors" style={{ color: "var(--text-secondary)" }}>
                  My Profile
                </Link>
              </>
            )}
            {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
              <Link href="/admin" className="hover:opacity-80 transition-colors font-medium" style={{ color: "var(--accent)" }}>
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              className="p-2 rounded-lg hover:bg-[var(--bg-highlight)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                    <User className="w-5 h-5" style={{ color: "var(--bg)" }} />
                  </div>
                  <span>{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-1 animate-fade-in" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Settings className="w-4 h-4" />
                      Profile & Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: "var(--navbar-bg)", borderColor: "var(--border)" }}>
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full"
              style={{ color: "var(--text-secondary)" }}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <Link href="/" className="block" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>Browse</Link>
            {user && (
              <>
                <Link href="/create" className="block" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>Create Guide</Link>
                <Link href="/profile" className="block" style={{ color: "var(--text-secondary)" }} onClick={() => setMenuOpen(false)}>My Profile</Link>
                {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                  <Link href="/admin" style={{ color: "var(--accent)" }} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1"><Button variant="secondary" className="w-full" size="sm">Log In</Button></Link>
                <Link href="/signup" className="flex-1"><Button className="w-full" size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

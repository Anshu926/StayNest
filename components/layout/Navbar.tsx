"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  ChevronDown,
  Heart,
  Bookmark,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface AuthUser {
  id?: string;
  role: "customer" | "provider" | "admin";
  name: string;
  email: string;
}

function readAuth(): AuthUser | null {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userStr) return JSON.parse(userStr);
  } catch {}
  return null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const syncAuth = useCallback(async () => {
    const localUser = readAuth();
    setUser(localUser);
    setIsLoading(false);

    // If local token exists, optionally verify with /api/auth/me to stay synced
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          setUser(null);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    syncAuth();

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [syncAuth]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    setMobileOpen(false);
    setDropdownOpen(false);
    router.push("/");
  };

  const isProvider = user?.role === "provider";
  const isAdmin = user?.role === "admin";

  const dashboardHref = isAdmin
    ? "/admin"
    : isProvider
    ? "/provider/dashboard"
    : "/saved";

  const dashboardLabel = isAdmin
    ? "Admin Panel"
    : isProvider
    ? "Dashboard"
    : "Saved Collections";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-warm group-hover:bg-primary-600 transition-colors">
              <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Stay<span className="text-primary-500">Nest</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/stays", label: "Find a Stay" },
              { href: "/tiffins", label: "Find Tiffin" },
              { href: "/study-spaces", label: "Study Spaces" },
              { href: "/new-to-nagpur", label: "New to the City?" },
            ].map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold"
                      : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Quick Wishlist & Saved Links (Only for Customers & Guests, NOT Providers/Admins) */}
            {!isProvider && !isAdmin && (
              <>
                <Link
                  href="/favorites"
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    pathname === "/favorites"
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      : "text-gray-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  }`}
                  title="Wishlist & Liked Items"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  <span className="hidden xl:inline">Wishlist</span>
                </Link>

                <Link
                  href="/saved"
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    pathname === "/saved"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                      : "text-gray-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  }`}
                  title="Saved Bookmarks & Collections"
                >
                  <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="hidden xl:inline">Saved</span>
                </Link>
              </>
            )}

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {!isLoading && (
              user ? (
                /* AUTHENTICATED USER STATE: Shows Profile, Dashboard & Logout */
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
                  {/* Provider Add Listing Shortcut */}
                  {isProvider && (
                    <Link
                      href="/provider/listings/new"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-900 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Listing</span>
                    </Link>
                  )}

                  {/* Provider / Admin Dashboard Link */}
                  {(isProvider || isAdmin) && (
                    <Link
                      href={dashboardHref}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors border border-gray-200 dark:border-slate-700"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary-500" />
                      <span>{dashboardLabel}</span>
                    </Link>
                  )}

                  {/* User Profile Dropdown Pill */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                      aria-label="User menu"
                    >
                      <div className="w-7 h-7 bg-gradient-to-tr from-primary-600 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="text-left hidden lg:block max-w-[100px]">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-none">
                          {user.name.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 capitalize leading-none mt-0.5 font-medium">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-400 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full capitalize border border-primary-200 dark:border-primary-900">
                            {user.role} Account
                          </span>
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        {isProvider && (
                          <>
                            <Link
                              href="/provider/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-primary-500" />
                              <span>Provider Dashboard</span>
                            </Link>
                            <Link
                              href="/provider/settings"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <UserIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
                              <span>Business Settings</span>
                            </Link>
                          </>
                        )}

                        {/* Customer Wishlist & Saved Collections */}
                        {!isProvider && !isAdmin && (
                          <>
                            <Link
                              href="/favorites"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                              <span>Liked Wishlist</span>
                            </Link>

                            <Link
                              href="/saved"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                              <span>Saved Collections</span>
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-100 dark:border-slate-800 my-1" />

                        {/* Dropdown Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direct Desktop Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 transition-colors"
                    title="Sign out of your account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                /* GUEST / UNREGISTERED STATE */
                <div className="flex items-center gap-2">
                  <Link
                    href="/list-your-service"
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-3 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                  >
                    List Your Service
                  </Link>
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-xs px-4 py-2 font-semibold shadow-warm"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Right Controls (Theme toggle + Hamburger) */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <button
              className="p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in shadow-2xl">
          <nav className="px-4 py-3 flex flex-col gap-1">
            <Link
              href="/stays"
              className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              🏠 Find a Stay
            </Link>
            <Link
              href="/tiffins"
              className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              🍱 Find Tiffin
            </Link>
            <Link
              href="/study-spaces"
              className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              📚 Study Spaces
            </Link>
            <Link
              href="/new-to-nagpur"
              className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              ✨ New to the City?
            </Link>

            {!isProvider && !isAdmin && (
              <>
                <Link
                  href="/favorites"
                  className="px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  Liked Wishlist
                </Link>
                <Link
                  href="/saved"
                  className="px-3 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  Saved Collections
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 dark:border-slate-800 my-1.5" />

            {!isLoading && (
              user ? (
                /* AUTHENTICATED USER IN MOBILE MENU: Profile card + Logout (NO Login/Signup) */
                <div className="space-y-2 pt-1">
                  {/* User Profile Card */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {isProvider && (
                    <Link
                      href="/provider/listings/new"
                      className="px-3 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add New Listing
                    </Link>
                  )}

                  <Link
                    href={dashboardHref}
                    className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary-500" />
                    {dashboardLabel}
                  </Link>

                  {/* Prominent Mobile Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2 transition-colors border border-red-100 dark:border-red-900/40"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                /* GUEST USER IN MOBILE MENU: Show List Your Service, Login & Signup */
                <>
                  <Link
                    href="/list-your-service"
                    className="px-3 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    🏢 List Your Service
                  </Link>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href="/login"
                      className="flex-1 text-center py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 shadow-warm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )
            )}
          </nav>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}

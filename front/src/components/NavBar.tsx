import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/react";
import { AuthGuard } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import tebLogo from "@assets/teb-logo-transparent.png";

function NavLinks() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const links = [
    { href: "/talent-hub", label: t("talentHub") },
    { href: "/corporate-portal", label: t("corporatePortal") },
    { href: "/support-funding", label: t("supportFunding") },
    { href: "/community-captains", label: t("communityCaptains") },
    { href: "/impact", label: t("impact") },
  ];
  return (
    <>
      {links.map((l) => {
        const active = location === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`teb-focus-ring relative px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "text-[#006fba]"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <span
              className="teb-link-underline"
              data-active={active ? "true" : "false"}
              style={active ? { color: "#ffb800" } : undefined}
            >
              <span style={active ? { color: "#006fba" } : undefined}>
                {l.label}
              </span>
            </span>
          </Link>
        );
      })}
    </>
  );
}



function MockUserMenu() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-foreground transition-colors"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "hsl(204 100% 36%)" }}
        >
          {user.avatarInitials ?? user.displayName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{user.displayName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Signed in as (Demo)</p>
              <p className="text-sm font-medium text-slate-900 truncate">Demo Account</p>
            </div>
            <button
              onClick={() => { setOpen(false); setLocation("/dashboard"); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
            </button>
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ClerkUserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  if (!user) return null;

  const displayName = user.firstName ?? user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Account";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted text-sm font-medium text-foreground transition-colors"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "hsl(204 100% 36%)" }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{displayName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); setLocation("/dashboard"); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
            </button>
            <button
              onClick={() => signOut(() => setLocation("/"))}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu() {
  const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";
  if (MOCK_MODE) return <MockUserMenu />;
  return <ClerkUserMenu />;
}

export default function NavBar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src={tebLogo}
              alt="The Empowerment Bridge logo"
              className="w-8 h-8 object-contain"
            />
            <div className="leading-tight">
              <span
                className="font-extrabold text-sm tracking-tight"
                style={{ color: "#1a1a2e" }}
              >
                The Empowerment Bridge
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-2">

            <AuthGuard when="signed-out">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  style={{
                    background: "hsl(43 100% 50%)",
                    color: "hsl(215 28% 17%)",
                  }}
                >
                  Get Started
                </Button>
              </SignUpButton>
            </AuthGuard>
            <AuthGuard when="signed-in">
              <UserMenu />
            </AuthGuard>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-foreground/70 hover:text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1 text-center">
          <NavLinks />
          <div className="flex gap-2 pt-2">
            <AuthGuard when="signed-out">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="flex-1">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="flex-1"
                  style={{
                    background: "hsl(43 100% 50%)",
                    color: "hsl(215 28% 17%)",
                  }}
                >
                  Get Started
                </Button>
              </SignUpButton>
            </AuthGuard>
            <AuthGuard when="signed-in">
              <Link
                href="/dashboard"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                <Button
                  size="sm"
                  className="w-full"
                  style={{ background: "hsl(204 100% 36%)" }}
                >
                  Dashboard
                </Button>
              </Link>
            </AuthGuard>
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, BarChart3,
  Store, Wallet, Upload, Bell, LogOut, ChevronRight, LayoutGrid, X, House
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { path: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard, tabIcon: House, title: "Hello there!", subtitle: "Overview of your home inventory", tile: "tile-deep" },
  { path: "/inventory", label: "Inventory", short: "Pantry", icon: Package, subtitle: "Manage your home products", tile: "tile-intense" },
  { path: "/shopping", label: "Shopping Lists", short: "Shopping", icon: ShoppingCart, subtitle: "Manage your shopping lists", tile: "tile-medium" },
  { path: "/prices", label: "Price Tracker", icon: TrendingUp, subtitle: "Track and compare prices across stores", tile: "tile-deep" },
  { path: "/stores", label: "Store Compare", icon: Store, subtitle: "Manage and compare your stores", tile: "tile-intense" },
  { path: "/analytics", label: "Analytics", icon: BarChart3, subtitle: "Where your money goes", tile: "tile-medium" },
  { path: "/budget", label: "Budget", icon: Wallet, subtitle: "Plan your monthly spending", tile: "tile-deep" },
  { path: "/import", label: "Import Data", icon: Upload, subtitle: "Import products and prices from CSV", tile: "tile-intense" },
  { path: "/alerts", label: "Alerts", short: "Alerts", icon: Bell, subtitle: "Stock and expiration reminders", tile: "tile-medium" },
];

// Mobile bottom bar: four primary tabs + "More" sheet for the rest
const tabPaths = ["/", "/inventory", "/shopping", "/alerts"];
const tabs = tabPaths.map(p => navItems.find(i => i.path === p));
const moreItems = navItems.filter(i => !tabPaths.includes(i.path));

function Logo({ className = "w-9 h-9" }) {
  return <img src="/icon.svg" alt="HomeStock" className={`${className} rounded-xl shadow-sm`} />;
}

function MobileHero({ item }) {
  return (
    <header className="lg:hidden relative app-hero text-white overflow-hidden" style={{ paddingTop: "var(--safe-top)" }}>
      {/* soft bubbles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15" />
      <div className="absolute top-16 -left-8 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative px-5 pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-heading font-extrabold text-base tracking-tight">HomeStock</span>
        </Link>
        <Link to="/alerts" className="w-10 h-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center active:scale-95 transition">
          <Bell className="w-5 h-5" />
        </Link>
      </div>

      <div className="relative px-5 pt-5 pb-16">
        <h1 className="font-heading font-black text-[28px] leading-tight">{item?.title || item?.label}</h1>
        <p className="text-sm text-white/85 mt-1">{item?.subtitle}</p>
      </div>

      {/* layered waves, medium purple behind and page background in front */}
      <svg className="absolute bottom-0 left-0 w-full h-12" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 20 C 70 0 130 40 210 22 S 340 6 400 18 V48 H0 Z" fill="hsl(var(--medium))" opacity="0.7" />
        <path d="M0 34 C 90 14 160 50 250 32 S 360 22 400 30 V48 H0 Z" fill="hsl(var(--background))" />
      </svg>
    </header>
  );
}

function BottomNav({ pathname, onMore, moreOpen }) {
  const moreActive = moreOpen || moreItems.some(i => i.path === pathname);
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3"
      style={{ paddingBottom: "calc(var(--safe-bottom) + 0.75rem)" }}
    >
      <div className="mx-auto max-w-md bg-card/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_-6px_hsl(258_60%_50%/0.25)] border border-border flex items-stretch justify-around px-2 py-2">
        {tabs.map(item => {
          const active = !moreOpen && pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center gap-0.5 py-1 active:scale-95 transition"
            >
              <span className={`w-11 h-8 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-deep text-white shadow-md shadow-deep/30" : "text-muted-foreground"}`}>
                {React.createElement(item.tabIcon || item.icon, { className: "w-5 h-5" })}
              </span>
              <span className={`text-[10px] font-semibold ${active ? "text-deep" : "text-muted-foreground"}`}>{item.short}</span>
            </Link>
          );
        })}
        <button onClick={onMore} className="flex-1 flex flex-col items-center gap-0.5 py-1 active:scale-95 transition">
          <span className={`w-11 h-8 rounded-2xl flex items-center justify-center transition-all ${moreActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
            <LayoutGrid className="w-5 h-5" />
          </span>
          <span className={`text-[10px] font-semibold ${moreActive ? "text-deep" : "text-muted-foreground"}`}>More</span>
        </button>
      </div>
    </nav>
  );
}

function MoreSheet({ open, onClose, pathname }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[hsl(258_40%_20%/0.35)] backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="absolute bottom-0 inset-x-0 bg-card rounded-t-[2rem] p-5 animate-sheet-up"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 1.5rem)" }}
      >
        <div className="w-10 h-1.5 rounded-full bg-muted mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-extrabold text-lg">More</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {moreItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`rounded-2xl p-3 flex flex-col items-center gap-2 text-center active:scale-95 transition ${pathname === item.path ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              <span className={`${item.tile} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                <item.icon className="w-6 h-6" />
              </span>
              <span className="text-xs font-semibold text-foreground leading-tight">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => window.location.href = "/"}
            className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center active:scale-95 transition"
          >
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
              <LogOut className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold text-foreground leading-tight">Reset App</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const current = navItems.find(i => i.path === location.pathname);

  useEffect(() => { setMoreOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex sticky top-0 h-screen w-[260px] bg-card border-r border-border flex-col">
        <div className="p-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <div>
              <h1 className="font-heading font-extrabold text-base text-foreground leading-tight">HomeStock</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Smart Inventory Manager</p>
            </div>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "app-hero text-white shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Reset App</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <MobileHero item={current} />

        <main className="flex-1 relative -mt-8 lg:mt-0 px-4 pb-nav lg:p-8">
          <Outlet />
        </main>
      </div>

      <BottomNav pathname={location.pathname} moreOpen={moreOpen} onMore={() => setMoreOpen(o => !o)} />
      <MoreSheet open={moreOpen} pathname={location.pathname} onClose={() => setMoreOpen(false)} />
    </div>
  );
}

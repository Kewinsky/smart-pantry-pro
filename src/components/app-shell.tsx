import { Link, useLocation } from "@tanstack/react-router";
import { Apple, Camera, ChevronDown, ClipboardList, Home, ListChecks, Settings, ShoppingBasket, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const nav = [
  { to:"/", label:"Przegląd", icon:Home }, { to:"/zapasy", label:"Moje zapasy", icon:ShoppingBasket },
  { to:"/wykorzystaj", label:"Wykorzystaj", icon:Sparkles }, { to:"/lista-zakupow", label:"Lista zakupów", icon:ListChecks }, { to:"/ustawienia", label:"Ustawienia", icon:Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:flex lg:flex-col">
      <Link to="/" className="flex h-20 items-center gap-3 px-7"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Apple className="size-5" /></span><span className="text-xl font-extrabold">Spiżarka</span></Link>
      <div className="px-5"><Button asChild variant="scan" size="touch" className="w-full"><Link to="/skanuj"><Camera /> Skanuj paragon</Link></Button></div>
      <nav className="mt-7 space-y-1 px-4">{nav.map(({to,label,icon:Icon}) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className={cn("flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", pathname === to && "bg-secondary text-primary")}><Icon className="size-5" />{label}</Link>)}</nav>
      <div className="mt-auto border-t border-border p-5"><p className="text-xs text-muted-foreground">Twój dom</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-soon-soft text-sm font-bold text-soon">AK</span><span className="text-sm font-semibold">Dom Kowalskich</span></div><ChevronDown className="size-4 text-muted-foreground" /></div></div>
    </aside>
    <div className="lg:pl-64">
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-7 lg:px-10"><div className="flex items-center gap-2 lg:hidden"><span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Apple className="size-4" /></span><span className="font-extrabold">Spiżarka</span></div><div className="hidden text-sm text-muted-foreground lg:block">Dom Kowalskich</div><div className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">AK</div></div>
      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-7 lg:px-10 lg:py-9 lg:pb-12">{children}</main>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {nav.slice(0,2).map(({to,label,icon:Icon}) => <MobileLink key={to} to={to} label={label} icon={Icon} active={pathname===to} />)}
      <Link to="/skanuj" className="flex flex-col items-center gap-1 py-2 text-[10px] font-bold text-primary"><span className="-mt-6 flex size-13 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg"><Camera className="size-5" /></span>Skanuj</Link>
      <MobileLink to="/wykorzystaj" label="Wykorzystaj" icon={Sparkles} active={pathname==="/wykorzystaj"} />
      <MobileLink to="/lista-zakupow" label="Lista" icon={ClipboardList} active={pathname==="/lista-zakupow"} />
    </nav>
  </div>;
}

function MobileLink({to,label,icon:Icon,active}:{to:"/"|"/zapasy"|"/wykorzystaj"|"/lista-zakupow"|"/ustawienia";label:string;icon:typeof Home;active:boolean}) {
  return <Link to={to} className={cn("flex flex-col items-center gap-1 py-3 text-[10px] font-semibold text-muted-foreground", active && "text-primary")}><Icon className="size-5" />{label}</Link>;
}
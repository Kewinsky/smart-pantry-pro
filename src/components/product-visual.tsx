import { Apple, Beef, Carrot, Milk, Package, Snowflake, Wheat } from "lucide-react";
import { cn } from "../lib/utils";

export function ProductVisual({ category, className }: { category: string; className?: string }) {
  const Icon = category === "Nabiał" ? Milk : category === "Mięso" || category === "Ryby" ? Beef : category === "Warzywa" ? Carrot : category === "Owoce" ? Apple : category === "Pieczywo" || category === "Sypkie" ? Wheat : category === "Mrożonki" ? Snowflake : Package;
  return <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary", className)}><Icon className="size-5" /></div>;
}
import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../state/app-context";
import type { StorageLocation } from "../types/app";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function ManualProductDialog() {
  const { addProduct } = useApp();
  const [open,setOpen] = useState(false); const [name,setName] = useState(""); const [quantity,setQuantity] = useState(1); const [location,setLocation] = useState<StorageLocation>("Lodówka");
  const submit = () => { if (!name.trim()) return; addProduct({ name:name.trim(), quantity, unit:"szt.", category:"Inne", storageLocation:location }); setName(""); setOpen(false); };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="touch"><Plus /> Dodaj produkt</Button></DialogTrigger><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Dodaj produkt</DialogTitle><DialogDescription>Dodaj pojedynczy produkt bez skanowania paragonu.</DialogDescription></DialogHeader><div className="space-y-4 pt-2"><label className="block text-sm font-semibold">Nazwa<Input className="mt-2 h-11" value={name} onChange={(event)=>setName(event.target.value)} placeholder="np. Awokado" autoFocus /></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Ilość<Input className="mt-2 h-11" type="number" min="0.1" step="0.1" value={quantity} onChange={(event)=>setQuantity(Number(event.target.value))} /></label><label className="block text-sm font-semibold">Miejsce<Select value={location} onValueChange={(value)=>setLocation(value as StorageLocation)}><SelectTrigger className="mt-2 h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Lodówka">Lodówka</SelectItem><SelectItem value="Zamrażarka">Zamrażarka</SelectItem><SelectItem value="Spiżarnia">Spiżarnia</SelectItem></SelectContent></Select></label></div><Button className="w-full" size="touch" onClick={submit} disabled={!name.trim()}>Dodaj do zapasów</Button></div></DialogContent></Dialog>;
}
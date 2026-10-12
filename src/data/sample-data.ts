import type { Product, ReceiptItem } from "../types/app";

const base: Array<[string,string,number,string,string,string]> = [
  ["p1","Mleko 2%",1,"l","Nabiał","Lodówka"], ["p2","Szpinak baby",150,"g","Warzywa","Lodówka"],
  ["p3","Pierś z kurczaka",500,"g","Mięso","Lodówka"], ["p4","Jogurt naturalny",2,"szt.","Nabiał","Lodówka"],
  ["p5","Pomidory malinowe",600,"g","Warzywa","Lodówka"], ["p6","Ser gouda",250,"g","Nabiał","Lodówka"],
  ["p7","Masło ekstra",200,"g","Nabiał","Lodówka"], ["p8","Jajka ściółkowe",10,"szt.","Nabiał","Lodówka"],
  ["p9","Ogórek zielony",2,"szt.","Warzywa","Lodówka"], ["p10","Hummus klasyczny",1,"opak.","Gotowe","Lodówka"],
  ["p11","Maliny",125,"g","Owoce","Lodówka"], ["p12","Marchew",1,"kg","Warzywa","Lodówka"],
  ["p13","Mrożony groszek",450,"g","Mrożonki","Zamrażarka"], ["p14","Łosoś atlantycki",2,"porcje","Ryby","Zamrażarka"],
  ["p15","Pierogi ruskie",450,"g","Mrożonki","Zamrażarka"], ["p16","Truskawki",300,"g","Owoce","Zamrażarka"],
  ["p17","Chleb żytni",1,"szt.","Pieczywo","Spiżarnia"], ["p18","Makaron penne",500,"g","Sypkie","Spiżarnia"],
  ["p19","Ryż basmati",1,"kg","Sypkie","Spiżarnia"], ["p20","Pomidory krojone",2,"puszki","Przetwory","Spiżarnia"],
  ["p21","Ciecierzyca",1,"puszka","Przetwory","Spiżarnia"], ["p22","Płatki owsiane",500,"g","Śniadanie","Spiżarnia"],
  ["p23","Jabłka ligol",1.2,"kg","Owoce","Spiżarnia"], ["p24","Oliwa z oliwek",500,"ml","Dodatki","Spiżarnia"],
];

const dates = ["2026-10-12","2026-10-13","2026-10-14","2026-10-15"];
export const initialProducts: Product[] = base.map((p, index) => ({
  id: p[0], name: p[1], quantity: p[2], unit: p[3], category: p[4], storageLocation: p[5] as Product["storageLocation"],
  addedAt: index < 5 ? "2026-10-12" : "2026-10-08", estimatedUseBy: index < 4 ? dates[index] : index < 12 ? "2026-10-18" : "2026-11-20",
  freshnessConfidence: index < 4 ? "medium" : "high", sourceReceiptId: index < 5 ? "r-biedronka" : undefined, status: "active",
}));

export const sampleReceiptItems: ReceiptItem[] = [
  { id:"r1", name:"Mleko UHT 2%", quantity:1, unit:"l", category:"Nabiał", storageLocation:"Lodówka", price:3.49 },
  { id:"r2", name:"Pomidor malinowy", quantity:0.62, unit:"kg", category:"Warzywa", storageLocation:"Lodówka", price:8.67 },
  { id:"r3", name:"Filet z kurczaka", quantity:0.54, unit:"kg", category:"Mięso", storageLocation:"Lodówka", price:13.49 },
  { id:"r4", name:"Jogurt naturalny", quantity:2, unit:"szt.", category:"Nabiał", storageLocation:"Lodówka", price:4.58 },
  { id:"r5", name:"Chleb żytni", quantity:1, unit:"szt.", category:"Pieczywo", storageLocation:"Spiżarnia", price:6.99 },
];
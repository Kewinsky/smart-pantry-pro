export type StorageLocation = "Lodówka" | "Zamrażarka" | "Spiżarnia";
export type ProductStatus = "active" | "consumed" | "discarded";

export type Product = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  storageLocation: StorageLocation;
  addedAt: string;
  estimatedUseBy: string;
  freshnessConfidence: "high" | "medium" | "low";
  sourceReceiptId?: string;
  status: ProductStatus;
};

export type ReceiptItem = Omit<Product, "addedAt" | "estimatedUseBy" | "freshnessConfidence" | "sourceReceiptId" | "status"> & { price?: number };

export type Receipt = {
  id: string;
  storeName: string;
  purchaseDate: string;
  total: number;
  items: ReceiptItem[];
  processingStatus: "ready" | "processing" | "review" | "complete";
};
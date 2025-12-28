
export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier: string;
  barcode?: string;
  image?: string; // base64 encoded string
  lastRestocked?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: SaleItem[];
  totalAmount: number;
  profit: number;
  paymentMethod: 'Cash' | 'G-Cash' | 'Utang';
  customerId?: string; // Link to customer if payment is 'Utang'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBalance: number;
  lastTransaction: string;
}

export interface DebtTransaction {
  id: string;
  customerId: string;
  type: 'Debt' | 'Payment';
  amount: number;
  timestamp: string;
  note?: string;
  saleId?: string;
}

export interface BusinessInsight {
  summary: string;
  fastMovingItems: string[];
  restockSuggestions: { productName: string; reason: string }[];
  estimatedProfitTrend: string;
}

export type View = 'POS' | 'Inventory' | 'Utang' | 'Analytics' | 'Docs';

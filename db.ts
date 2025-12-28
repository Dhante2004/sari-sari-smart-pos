
import { Product, Sale, Customer, DebtTransaction } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'sari_pos_products',
  SALES: 'sari_pos_sales',
  CUSTOMERS: 'sari_pos_customers',
  DEBT_TXNS: 'sari_pos_debt_txns',
  USER_ROLE: 'sari_pos_role'
};

// Initial Sample Data
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Lucky Me Noodles (Beef)', category: 'Snacks', costPrice: 9, sellingPrice: 12, stockQuantity: 24, minStockLevel: 5, supplier: 'Puregold' },
  { id: '2', name: 'Kopiko Brown 3-in-1', category: 'Drinks', costPrice: 6, sellingPrice: 9, stockQuantity: 48, minStockLevel: 10, supplier: 'Puregold' },
  { id: '3', name: 'Coke 295ml', category: 'Drinks', costPrice: 15, sellingPrice: 18, stockQuantity: 12, minStockLevel: 6, supplier: 'Coca-Cola Sales' },
  { id: '4', name: 'Pancit Canton Extra Hot', category: 'Snacks', costPrice: 11, sellingPrice: 15, stockQuantity: 3, minStockLevel: 5, supplier: 'Puregold' }
];

export const db = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },
  saveSale: (sale: Sale) => {
    const sales = db.getSales();
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([...sales, sale]));
    
    // Update inventory
    const products = db.getProducts();
    const updatedProducts = products.map(p => {
      const soldItem = sale.items.find(si => si.productId === p.id);
      if (soldItem) {
        return { ...p, stockQuantity: p.stockQuantity - soldItem.quantity };
      }
      return p;
    });
    db.saveProducts(updatedProducts);

    // If Utang, update customer balance
    if (sale.paymentMethod === 'Utang' && sale.customerId) {
      db.updateCustomerBalance(sale.customerId, sale.totalAmount, 'Debt', sale.id);
    }
  },
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getDebtTransactions: (): DebtTransaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DEBT_TXNS);
    return data ? JSON.parse(data) : [];
  },
  updateCustomerBalance: (customerId: string, amount: number, type: 'Debt' | 'Payment', saleId?: string) => {
    const customers = db.getCustomers();
    const txns = db.getDebtTransactions();
    
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const delta = type === 'Debt' ? amount : -amount;
        return { 
          ...c, 
          totalBalance: c.totalBalance + delta,
          lastTransaction: new Date().toISOString()
        };
      }
      return c;
    });
    
    const newTxn: DebtTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      type,
      amount,
      timestamp: new Date().toISOString(),
      saleId
    };

    db.saveCustomers(updatedCustomers);
    localStorage.setItem(STORAGE_KEYS.DEBT_TXNS, JSON.stringify([...txns, newTxn]));
  },
  resetData: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  }
};

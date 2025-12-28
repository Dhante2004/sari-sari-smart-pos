
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, BookOpen, UserCheck } from 'lucide-react';
import { db } from './db';
import { Product, Sale, View, Customer } from './types';
import POSView from './components/POSView';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import DocumentationView from './components/DocumentationView';
import UtangView from './components/UtangView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('POS');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(db.getProducts());
    setSales(db.getSales());
    setCustomers(db.getCustomers());
  };

  const navItems = [
    { id: 'POS' as View, label: 'Tindahan (POS)', icon: ShoppingCart },
    { id: 'Inventory' as View, label: 'Imbentaryo', icon: Package },
    { id: 'Utang' as View, label: 'Listahan (Utang)', icon: UserCheck },
    { id: 'Analytics' as View, label: 'Kita (Sales)', icon: TrendingUp },
    { id: 'Docs' as View, label: 'Tulong (Help)', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden select-none">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-20 flex-col bg-white border-r py-8 items-center gap-8 shrink-0">
        <div className="bg-blue-600 p-2 rounded-xl mb-4">
          <ShoppingCart className="text-white w-6 h-6" />
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`p-3 rounded-2xl transition-all hover:scale-110 ${
              activeView === item.id ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
            title={item.label}
          >
            <item.icon className="w-7 h-7" />
          </button>
        ))}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl tracking-tight text-slate-800">
              {navItems.find(n => n.id === activeView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-800">Tindahan ni Aling Nena</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sari-Sari Store Admin</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-50 shadow-sm">
              AN
            </div>
          </div>
        </header>

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 no-scrollbar relative">
          {activeView === 'POS' && <POSView products={products} customers={customers} onSaleComplete={refreshData} />}
          {activeView === 'Inventory' && <InventoryView products={products} onUpdate={refreshData} />}
          {activeView === 'Utang' && <UtangView customers={customers} onUpdate={refreshData} />}
          {activeView === 'Analytics' && <AnalyticsView products={products} sales={sales} />}
          {activeView === 'Docs' && <DocumentationView />}
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden z-20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                activeView === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-1 uppercase">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;

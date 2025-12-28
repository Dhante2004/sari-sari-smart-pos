
import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, CheckCircle, Smartphone, ShoppingCart, UserCheck, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Product, SaleItem, Customer } from '../types';
import { db } from '../db';

interface POSViewProps {
  products: Product[];
  customers: Customer[];
  onSaleComplete: () => void;
}

const POSView: React.FC<POSViewProps> = ({ products, customers, onSaleComplete }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        totalPrice: product.sellingPrice
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const product = products.find(p => p.id === id);
        const newQty = Math.max(0, item.quantity + delta);
        // Prevent adding more than what's in stock
        if (delta > 0 && product && newQty > product.stockQuantity) return item;
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  const handleCheckout = (method: 'Cash' | 'G-Cash' | 'Utang', customerId?: string) => {
    if (cart.length === 0) return;

    if (method === 'Utang' && !customerId) {
      setShowCustomerPicker(true);
      return;
    }

    const profit = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      const itemProfit = (item.unitPrice - (product?.costPrice || 0)) * item.quantity;
      return acc + itemProfit;
    }, 0);

    const sale = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      items: [...cart],
      totalAmount: cartTotal,
      profit,
      paymentMethod: method,
      customerId
    };

    db.saveSale(sale);
    setLastSale(sale);
    setCart([]);
    setShowReceipt(true);
    setShowCustomerPicker(false);
    onSaleComplete();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Search Bar */}
      <div className="p-4 bg-white shadow-sm shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Maghanap ng paninda (e.g. Coke, Noodles)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 no-scrollbar">
          {filteredProducts.map(product => {
            const isLow = product.stockQuantity <= product.minStockLevel;
            const inCart = cart.find(item => item.productId === product.id)?.quantity || 0;
            const availableToBuy = product.stockQuantity - inCart;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={availableToBuy <= 0}
                className={`flex flex-col items-stretch rounded-[2rem] text-left transition-all active:scale-95 shadow-sm border overflow-hidden ${
                  availableToBuy <= 0 ? 'bg-slate-200 opacity-50 grayscale border-slate-200' : 'bg-white hover:border-blue-200 border-slate-100'
                }`}
              >
                {/* Product Image Area */}
                <div className="h-24 sm:h-32 bg-slate-100 relative">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {inCart > 0 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                      {inCart}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-3 pt-2">
                  <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 mb-1">{product.name}</div>
                  <div className="flex justify-between items-end w-full">
                    <div className="text-blue-600 font-black text-base sm:text-lg">₱{product.sellingPrice}</div>
                    <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isLow ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.stockQuantity} stock
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cart Panel */}
        <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l flex flex-col shrink-0 shadow-lg relative">
          <div className="p-4 border-bottom flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Order Summary
            </h2>
            <span className="text-xs font-medium text-slate-400">{cart.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-60">
                <ShoppingCart className="w-16 h-16 mb-2" />
                <p className="font-medium">Walang laman ang basket</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                    <div className="text-xs text-slate-500 font-medium">₱{item.unitPrice} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 rounded-full bg-white border text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-slate-800 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-90 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-4 bg-slate-50 border-t space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-slate-500 font-medium">Total Amount</span>
              <span className="text-2xl font-black text-blue-600">₱{cartTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout('Cash')}
                className="py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex flex-col items-center"
              >
                <span className="text-xs uppercase">Cash</span>
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout('G-Cash')}
                className="py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex flex-col items-center"
              >
                <div className="flex items-center gap-1 uppercase tracking-wider text-xs">
                  <Smartphone className="w-3 h-3" />
                  <span>G-Cash</span>
                </div>
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => setShowCustomerPicker(true)}
                className="py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all flex flex-col items-center"
              >
                <div className="flex items-center gap-1 uppercase tracking-wider text-xs">
                  <UserCheck className="w-3 h-3" />
                  <span>Utang</span>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Picker Overlay */}
          {showCustomerPicker && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="p-4 border-b flex items-center gap-4 bg-slate-50">
                <button onClick={() => setShowCustomerPicker(false)} className="p-2 rounded-full hover:bg-slate-200">
                  <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h3 className="font-black text-slate-800">Select Debtor</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {customers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold mb-4">No customers registered.</p>
                    <p className="text-xs text-slate-400">Add them in the 'Utang' tab first.</p>
                  </div>
                ) : (
                  customers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleCheckout('Utang', c.id)}
                      className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 text-left transition-colors border border-slate-100 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.phone}</div>
                      </div>
                      <div className="text-red-600 font-black">₱{c.totalBalance}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-8 flex flex-col items-center justify-center text-white ${lastSale.paymentMethod === 'Utang' ? 'bg-red-500' : 'bg-green-500'}`}>
              <div className="bg-white/20 p-4 rounded-full mb-4">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black">{lastSale.paymentMethod === 'Utang' ? 'Listed Successfully!' : 'Salamat Po!'}</h2>
              <p className="opacity-90 font-medium">Payment: {lastSale.paymentMethod}</p>
            </div>
            <div className="p-8">
              <div className="space-y-4 mb-8">
                {lastSale.items.map((item: any) => (
                  <div key={item.productId} className="flex justify-between font-medium text-slate-700">
                    <span className="text-sm">{item.quantity}x {item.productName}</span>
                    <span className="text-sm font-bold tracking-tight">₱{item.totalPrice}</span>
                  </div>
                ))}
                <div className="border-t border-dashed pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-black text-2xl text-blue-600">₱{lastSale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;


import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, PackagePlus, X, Camera, Image as ImageIcon, Save, Trash } from 'lucide-react';
import { Product } from '../types';
import { db } from '../db';

interface InventoryViewProps {
  products: Product[];
  onUpdate: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formState, setFormState] = useState<Partial<Product>>({
    name: '', category: 'Snacks', costPrice: 0, sellingPrice: 0, stockQuantity: 0, minStockLevel: 5, supplier: '', image: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Snacks', 'Drinks', 'Rice', 'Canned Goods', 'Cigarettes', 'Toiletries', 'Others'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormState({
      name: '', category: 'Snacks', costPrice: 0, sellingPrice: 0, stockQuantity: 0, minStockLevel: 5, supplier: '', image: ''
    });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormState(product);
    setShowForm(true);
  };

  const handleSaveProduct = () => {
    if (!formState.name || !formState.sellingPrice) return;
    
    if (editingProduct) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...formState as Product } : p
      );
      db.saveProducts(updatedProducts);
    } else {
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: formState.name || '',
        category: formState.category || 'Others',
        costPrice: Number(formState.costPrice) || 0,
        sellingPrice: Number(formState.sellingPrice) || 0,
        stockQuantity: Number(formState.stockQuantity) || 0,
        minStockLevel: Number(formState.minStockLevel) || 5,
        supplier: formState.supplier || 'Local',
        image: formState.image
      };
      db.saveProducts([...products, product]);
    }
    
    setShowForm(false);
    onUpdate();
  };

  const confirmDelete = () => {
    if (productToDelete) {
      db.saveProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
      onUpdate();
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Imbentaryo</h2>
          <p className="text-slate-500 font-medium">Manage your stocks and prices</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Dagdag Paninda
        </button>
      </div>

      <div className="space-y-4">
        {products.map(product => {
          const isLow = product.stockQuantity <= product.minStockLevel;
          return (
            <div key={product.id} className={`bg-white p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md ${isLow ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  {isLow && (
                    <div className="absolute top-0 right-0 p-1 bg-red-500 rounded-bl-lg">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-xs font-bold text-slate-400">Cost: <span className="text-slate-600">₱{product.costPrice}</span></div>
                    <div className="text-xs font-bold text-slate-400">Price: <span className="text-blue-600 font-black">₱{product.sellingPrice}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex-1 sm:flex-none text-right">
                  <div className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{product.stockQuantity}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Stocks Left</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(product)} className="p-3 rounded-xl bg-slate-50 text-blue-600 hover:bg-blue-50 transition-colors" title="Edit/Restock">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setProductToDelete(product)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full mb-6">
                <Trash className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Sigurado ka ba?</h3>
              <p className="text-slate-500 font-medium mb-8">
                Mabubura ang <span className="text-slate-800 font-bold">"{productToDelete.name}"</span> sa iyong listahan. Hindi na ito maibabalik.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  Oo, Burahin na
                </button>
                <button
                  onClick={() => setProductToDelete(null)}
                  className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Hindi, I-cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="font-black text-xl text-slate-800">{editingProduct ? 'I-Edit o Mag-Restock' : 'Bago na Paninda'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer overflow-hidden group relative hover:border-blue-300 transition-all"
                >
                  {formState.image ? (
                    <>
                      <img src={formState.image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Camera className="w-6 h-6" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Mag-Photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Pangalan ng Item</label>
                <input
                  type="text"
                  placeholder="e.g. Gardenia Classic White Bread"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Kategorya</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none font-medium"
                    value={formState.category}
                    onChange={e => setFormState({...formState, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Stock Qty</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
                      value={formState.stockQuantity}
                      onChange={e => setFormState({...formState, stockQuantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Puhunan (Cost)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
                    value={formState.costPrice}
                    onChange={e => setFormState({...formState, costPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Presyo (Selling)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
                    value={formState.sellingPrice}
                    onChange={e => setFormState({...formState, sellingPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Supplier</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none"
                  value={formState.supplier}
                  onChange={e => setFormState({...formState, supplier: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
              <button onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors">Kansela</button>
              <button 
                onClick={handleSaveProduct} 
                className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> I-Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;

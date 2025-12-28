
import React, { useState } from 'react';
import { UserPlus, Search, Phone, Receipt, History, DollarSign, Plus, X, ArrowLeft } from 'lucide-react';
import { Customer, DebtTransaction } from '../types';
import { db } from '../db';

interface UtangViewProps {
  customers: Customer[];
  onUpdate: () => void;
}

const UtangView: React.FC<UtangViewProps> = ({ customers, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddCustomer = () => {
    if (!newCustomer.name) return;
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCustomer.name,
      phone: newCustomer.phone,
      totalBalance: 0,
      lastTransaction: new Date().toISOString()
    };
    db.saveCustomers([...customers, customer]);
    setNewCustomer({ name: '', phone: '' });
    setShowAddForm(false);
    onUpdate();
  };

  const handlePayment = () => {
    if (!selectedCustomer || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    db.updateCustomerBalance(selectedCustomer.id, amount, 'Payment');
    setPaymentAmount('');
    setShowPaymentModal(false);
    // Refresh local selected customer state
    const updated = db.getCustomers().find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
    onUpdate();
  };

  const debtTxns = selectedCustomer 
    ? db.getDebtTransactions().filter(t => t.customerId === selectedCustomer.id).reverse()
    : [];

  return (
    <div className="p-4 max-w-5xl mx-auto pb-32">
      {selectedCustomer ? (
        <div className="space-y-6 animate-in slide-in-from-left duration-300">
          {/* Header for Customer Detail */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-full hover:bg-slate-200">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-2xl font-black text-slate-800">{selectedCustomer.name}'s Ledger</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Balance Card */}
            <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Outstanding Balance</div>
                 <div className="text-4xl font-black">₱{selectedCustomer.totalBalance.toFixed(2)}</div>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <DollarSign className="w-24 h-24" />
               </div>
               <button 
                 onClick={() => setShowPaymentModal(true)}
                 className="mt-6 w-full py-4 bg-white text-red-600 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <DollarSign className="w-5 h-5" /> Bayad Utang
               </button>
            </div>

            {/* History Table */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
               <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                 <History className="w-5 h-5 text-blue-600" /> Recent Activity
               </h3>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                 {debtTxns.length === 0 ? (
                   <p className="text-center text-slate-400 py-10">No history yet.</p>
                 ) : (
                   debtTxns.map(t => (
                     <div key={t.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                          <div className={`text-xs font-black uppercase tracking-wider ${t.type === 'Debt' ? 'text-red-500' : 'text-green-500'}`}>
                            {t.type === 'Debt' ? 'Credited' : 'Paid'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">{new Date(t.timestamp).toLocaleString()}</div>
                        </div>
                        <div className={`font-black text-lg ${t.type === 'Debt' ? 'text-red-500' : 'text-green-500'}`}>
                          {t.type === 'Debt' ? '+' : '-'} ₱{t.amount.toFixed(2)}
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Listahan ng Utang</h2>
              <p className="text-slate-500 font-medium">Digital "Kwaderno" for your loyal customers</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-200"
            >
              <UserPlus className="w-5 h-5" /> Bagong Debtor
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-left hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-red-50 transition-colors">
                    <History className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
                  </div>
                  <div className={`text-xl font-black ${c.totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₱{c.totalBalance.toFixed(2)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 leading-tight">{c.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs font-bold">{c.phone || 'No Phone'}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Balance</span>
                  <div className="p-1 rounded-full bg-slate-50">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-xl text-slate-800">Bagong Suking Debtor</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Customer Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 border-none outline-none"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 border-none outline-none"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
              <button onClick={handleAddCustomer} className="flex-[2] py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-100">Add Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-8 flex flex-col items-center">
               <div className="bg-green-100 p-4 rounded-full mb-4">
                 <DollarSign className="w-10 h-10 text-green-600" />
               </div>
               <h2 className="text-xl font-black text-slate-800">Record Payment</h2>
               <p className="text-slate-400 text-sm font-medium mb-6">How much is {selectedCustomer?.name} paying?</p>
               
               <div className="w-full relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₱</span>
                 <input
                   type="number"
                   autoFocus
                   className="w-full pl-10 pr-4 py-5 rounded-3xl bg-slate-50 text-3xl font-black text-slate-800 border-none outline-none ring-2 ring-transparent focus:ring-green-500 transition-all"
                   value={paymentAmount}
                   onChange={e => setPaymentAmount(e.target.value)}
                 />
               </div>

               <div className="grid grid-cols-2 gap-3 w-full mt-8">
                 <button onClick={() => setShowPaymentModal(false)} className="py-4 font-bold text-slate-400">Close</button>
                 <button 
                  onClick={handlePayment}
                  className="py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-100"
                 >
                   Confirm
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UtangView;

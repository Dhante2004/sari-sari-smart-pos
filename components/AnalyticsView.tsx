
import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, DollarSign, Package, Calendar, Loader2, PieChart as PieIcon, BarChart3, Download, FileText, Table } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';
import { Product, Sale, BusinessInsight, Customer } from '../types';
import { getBusinessInsights } from '../geminiService';
import { db } from '../db';

interface AnalyticsViewProps {
  products: Product[];
  sales: Sale[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ products, sales }) => {
  const [insight, setInsight] = useState<BusinessInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      if (sales.length === 0) return;
      setLoading(true);
      const res = await getBusinessInsights(products, sales);
      setInsight(res);
      setLoading(false);
    }
    fetchInsights();
  }, [products, sales]);

  // Data transformations
  const dailyStats = sales.reduce((acc: any, sale) => {
    const day = new Date(sale.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
    acc[day] = (acc[day] || 0) + sale.totalAmount;
    return acc;
  }, {});

  const chartData = Object.entries(dailyStats).map(([name, amount]) => ({ name, amount }));

  // Top Selling Products
  const productSalesMap = sales.reduce((acc: any, sale) => {
    sale.items.forEach(item => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
    });
    return acc;
  }, {});

  const topProductsData = Object.entries(productSalesMap)
    .map(([name, qty]) => ({ name, qty: qty as number }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Sales by Category
  const categorySalesMap = sales.reduce((acc: any, sale) => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product?.category || 'Others';
      acc[category] = (acc[category] || 0) + item.totalPrice;
    });
    return acc;
  }, {});

  const categoryData = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value: value as number }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);

  // CSV Export Utility
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventory = () => {
    const headers = ["ID", "Name", "Category", "Cost Price", "Selling Price", "Stock Qty", "Min Stock", "Supplier"];
    const rows = products.map(p => [
      p.id, p.name, p.category, p.costPrice.toString(), p.sellingPrice.toString(), 
      p.stockQuantity.toString(), p.minStockLevel.toString(), p.supplier
    ]);
    downloadCSV(`inventory_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  const exportSales = () => {
    const headers = ["Date", "ID", "Items Summary", "Total Amount", "Profit", "Payment Method", "Customer ID"];
    const rows = sales.map(s => [
      new Date(s.timestamp).toLocaleString(),
      s.id,
      s.items.map(i => `${i.productName} (x${i.quantity})`).join("; "),
      s.totalAmount.toString(),
      s.profit.toString(),
      s.paymentMethod,
      s.customerId || "N/A"
    ]);
    downloadCSV(`sales_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  const exportDebtors = () => {
    const customers = db.getCustomers();
    const headers = ["Name", "Phone", "Total Balance", "Last Transaction"];
    const rows = customers.map(c => [
      c.name, c.phone, c.totalBalance.toString(), new Date(c.lastTransaction).toLocaleString()
    ]);
    downloadCSV(`debtors_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-32">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-100">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black">₱{totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total Sales</div>
        </div>
        <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-lg shadow-emerald-100">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black">₱{totalProfit.toLocaleString()}</div>
          <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total Profit</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-800">{sales.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-800">{products.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items in Store</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Sales Trend (Weekly)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          
          <h3 className="font-black text-xl mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" /> Smart Advisor
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="font-bold text-slate-400">Analysing store performance...</p>
            </div>
          ) : insight ? (
            <div className="space-y-6 overflow-y-auto no-scrollbar">
              <div>
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-2">Weekly Summary</div>
                <p className="text-sm font-medium leading-relaxed opacity-90">{insight.summary}</p>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-3">Mabilis Mabenta</div>
                <div className="flex flex-wrap gap-2">
                  {insight.fastMovingItems.map(item => (
                    <span key={item} className="text-[10px] bg-white/10 px-3 py-1.5 rounded-full font-bold border border-white/10">{item}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-3">Restock Recommendation</div>
                <div className="space-y-3">
                  {insight.restockSuggestions.map(rec => (
                    <div key={rec.productName} className="p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="text-xs font-black">{rec.productName}</div>
                      <div className="text-[10px] opacity-60 font-medium">{rec.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 font-bold text-center flex-1 flex items-center justify-center">
              Not enough sales data for AI advice yet. Try recording more sales!
            </div>
          )}
        </div>

        {/* Top Products Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Pinaka-Mabenta (Quantity)
          </h3>
          <div className="h-64 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#475569'}} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="qty" radius={[0, 10, 10, 0]} barSize={20}>
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">No product data</div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-orange-600" /> Sales by Category
          </h3>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">No category data</div>
            )}
          </div>
        </div>

        {/* Export Data Section */}
        <div className="lg:col-span-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" /> Reports & Backup (CSV)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={exportInventory}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">Inventory Report</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase">CSV Format</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </button>

            <button 
              onClick={exportSales}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">Sales History</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase">CSV Format</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button 
              onClick={exportDebtors}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-red-50 transition-colors border border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Table className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">List of Debtors</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase">CSV Format</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-300 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;

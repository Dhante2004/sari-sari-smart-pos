
import React from 'react';
import { Book, Target, ShieldCheck, Cpu, Code2 } from 'lucide-react';

const DocumentationView: React.FC = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto pb-32 space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Project Documentation</h1>
        <p className="text-slate-500 font-medium leading-relaxed">
          Comprehensive breakdown of the <strong>Sari-Sari Smart POS</strong> system designed for small-scale retail businesses in the Philippines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-4">Problem Statement</h2>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Many Sari-Sari stores still rely on manual notebooks ("listing") to track inventory and daily credit ("utang"). 
            This leads to stockouts of popular items, inaccurate profit tracking, and difficulty in managing expiration dates.
            Existing POS systems are often too complex, require high-end hardware, or constant internet.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-4">Key Objectives</h2>
          <ul className="text-slate-500 text-sm space-y-3 font-medium">
            <li className="flex gap-2"><span>•</span> Automate inventory deduction per sale.</li>
            <li className="flex gap-2"><span>•</span> Provide clear profit visualization.</li>
            <li className="flex gap-2"><span>•</span> Leverage AI to predict when to restock.</li>
            <li className="flex gap-2"><span>•</span> Ensure mobile-first, offline usability.</li>
          </ul>
        </section>
      </div>

      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">System Architecture</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-black text-blue-400 mb-1">Frontend</div>
              <div className="text-xs opacity-70">React + Tailwind CSS for a lightweight, mobile-responsive UI.</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-black text-blue-400 mb-1">Local Engine</div>
              <div className="text-xs opacity-70">LocalStorage for instant, offline-first data persistence.</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-black text-blue-400 mb-1">AI Logic</div>
              <div className="text-xs opacity-70">Gemini 3 Flash for analyzing trends and generating Taglish summaries.</div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Database Schema (ERD Logic)</h3>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="font-bold text-green-400 mb-2">TABLE: Products</div>
                <div>- id: STRING (PK)</div>
                <div>- name: STRING</div>
                <div>- cost_price: FLOAT</div>
                <div>- selling_price: FLOAT</div>
                <div>- stock_qty: INT</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="font-bold text-green-400 mb-2">TABLE: Sales</div>
                <div>- id: STRING (PK)</div>
                <div>- total: FLOAT</div>
                <div>- profit: FLOAT</div>
                <div>- timestamp: DATETIME</div>
                <div>- items: JSON_ARRAY</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-blue-600" /> Future Enhancements
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div>
              <div className="font-black text-slate-800">Cloud Sync</div>
              <p className="text-xs text-slate-500 font-medium">Automatic cloud backup when WiFi becomes available.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div>
              <div className="font-black text-slate-800">Barcode Support</div>
              <p className="text-xs text-slate-500 font-medium">Integrating camera-based scanning for faster checkout.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div>
              <div className="font-black text-slate-800">Debt Tracker (Utang)</div>
              <p className="text-xs text-slate-500 font-medium">Credit management module to track regular customer balances.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationView;

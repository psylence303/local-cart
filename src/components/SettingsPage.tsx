/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Store, AlertCircle, Check } from 'lucide-react';
import { Category } from '../types';

interface SettingsPageProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  shops: string[];
  setShops: (shops: string[]) => void;
  onClose: () => void;
}

// 12 beautiful preset color styles mapping to Tailwind
const COLOR_PRESETS = [
  { label: 'Emerald', value: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { label: 'Blue', value: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Amber', value: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: 'Red', value: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { label: 'Orange', value: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { label: 'Cyan', value: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  { label: 'Indigo', value: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  { label: 'Purple', value: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { label: 'Teal', value: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
  { label: 'Pink', value: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { label: 'Gold', value: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' },
  { label: 'Slate', value: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
];

export default function SettingsPage({
  categories,
  setCategories,
  shops,
  setShops,
  onClose,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'shops'>('categories');
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [catError, setCatError] = useState('');

  // Shop Form State
  const [newShopName, setNewShopName] = useState('');
  const [shopError, setShopError] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');

    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCatError('Category name cannot be empty');
      return;
    }

    if (categories.length >= 100) {
      setCatError('Category list limit reached (max 100)');
      return;
    }

    // Check duplicate case-insensitive
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setCatError('Category already exists');
      return;
    }

    const updated = [...categories, { name: trimmed, color: selectedColor }];
    setCategories(updated);
    setNewCatName('');
    // Auto pick next default color to make it fun
    const currentIndex = COLOR_PRESETS.findIndex(p => p.value === selectedColor);
    const nextIndex = (currentIndex + 1) % COLOR_PRESETS.length;
    setSelectedColor(COLOR_PRESETS[nextIndex].value);
  };

  const handleDeleteCategory = (name: string) => {
    if (categories.length <= 1) {
      alert('You must keep at least one category!');
      return;
    }
    const updated = categories.filter((c) => c.name !== name);
    setCategories(updated);
  };

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    setShopError('');

    const trimmed = newShopName.trim();
    if (!trimmed) {
      setShopError('Store name cannot be empty');
      return;
    }

    if (shops.length >= 50) {
      setShopError('Store list limit reached (max 50)');
      return;
    }

    // Check duplicate case-insensitive
    const exists = shops.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setShopError('Store already exists');
      return;
    }

    const updated = [...shops, trimmed];
    setShops(updated);
    setNewShopName('');
  };

  const handleDeleteShop = (name: string) => {
    if (shops.length <= 1) {
      alert('You must keep at least one store!');
      return;
    }
    const updated = shops.filter((s) => s !== name);
    setShops(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden select-none">
      
      {/* Settings Top Header Bar */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 shrink-0 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-slate-900 font-extrabold text-base tracking-tight leading-none">Settings</h1>
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Customize Lists & Filters</span>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="bg-white px-5 py-2.5 border-b border-slate-100 shrink-0 flex gap-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Categories ({categories.length}/100)
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'shops'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Stores ({shops.length}/50)
        </button>
      </div>

      {/* Main Settings Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 no-scrollbar">
        
        {activeTab === 'categories' ? (
          <>
            {/* ADD CATEGORY FORM */}
            <form onSubmit={handleAddCategory} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-3.5 shadow-xs">
              <h3 className="text-slate-800 font-bold text-xs tracking-wide uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-600" /> Add New Category
              </h3>

              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (e.target.value.trim()) setCatError('');
                  }}
                  placeholder="Category Name (e.g., Bakery 🍞)"
                  maxLength={30}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Color Preset Picker */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Select Color Style:</span>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColor === preset.value;
                    const parts = preset.value.split(' ');
                    const bgClass = parts[0]; // get the bg-color
                    const borderClass = parts[2] || 'border-slate-200';
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setSelectedColor(preset.value)}
                        title={preset.label}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center relative hover:scale-105 ${bgClass} ${borderClass} ${
                          isSelected ? 'scale-110 ring-2 ring-teal-500/40 ring-offset-1 border-teal-500' : 'border-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-slate-800 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {catError && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={categories.length >= 100}
                className={`w-full py-2 px-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  categories.length >= 100
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Category
              </button>
            </form>

            {/* CATEGORIES LIST */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Manage Categories ({categories.length})
              </span>

              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xxs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cat.color}`}>
                        {cat.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteCategory(cat.name)}
                      title={`Delete category: ${cat.name}`}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ADD SHOP FORM */}
            <form onSubmit={handleAddShop} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-3.5 shadow-xs">
              <h3 className="text-slate-800 font-bold text-xs tracking-wide uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" /> Add New Store
              </h3>

              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={newShopName}
                  onChange={(e) => {
                    setNewShopName(e.target.value);
                    if (e.target.value.trim()) setShopError('');
                  }}
                  placeholder="Store Name (e.g., Target)"
                  maxLength={30}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {shopError && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{shopError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={shops.length >= 50}
                className={`w-full py-2 px-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  shops.length >= 50
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Store
              </button>
            </form>

            {/* SHOPS LIST */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Manage Stores ({shops.length})
              </span>

              <div className="flex flex-col gap-2">
                {shops.map((shp) => (
                  <div
                    key={shp}
                    className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-xxs"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Store className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{shp}</span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteShop(shp)}
                      title={`Delete store: ${shp}`}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}

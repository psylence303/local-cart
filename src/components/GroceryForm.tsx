/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Plus, Minus, Tag, Store, Sparkles } from 'lucide-react';
import { GroceryItem, Category } from '../types';
import CameraCapture from './CameraCapture';

interface GroceryFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<GroceryItem, 'id' | 'completed' | 'createdAt'>) => void;
  editingItem?: GroceryItem | null;
  categories: Category[];
  shops: string[];
}

export default function GroceryForm({ onClose, onSubmit, editingItem, categories, shops }: GroceryFormProps) {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  
  // Category state
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Shop state
  const [shop, setShop] = useState('');
  const [isCustomShop, setIsCustomShop] = useState(false);
  const [customShop, setCustomShop] = useState('');

  // Photo
  const [photoUrl, setPhotoUrl] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Populate fields if editing
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setQuantity(editingItem.quantity);
      setDescription(editingItem.description || '');
      setPhotoUrl(editingItem.photoUrl || '');

      // Check if editing item category is standard or custom
      if (editingItem.category) {
        const isStandardCat = categories.some(c => c.name === editingItem.category);
        if (isStandardCat) {
          setCategory(editingItem.category);
          setIsCustomCategory(false);
        } else {
          setCategory('Custom');
          setIsCustomCategory(true);
          setCustomCategory(editingItem.category);
        }
      } else {
        setCategory('');
      }

      // Check if editing item shop is standard or custom
      if (editingItem.shop) {
        const isStandardShp = shops.includes(editingItem.shop);
        if (isStandardShp) {
          setShop(editingItem.shop);
          setIsCustomShop(false);
        } else {
          setShop('Custom');
          setIsCustomShop(true);
          setCustomShop(editingItem.shop);
        }
      } else {
        setShop('');
      }
    }
  }, [editingItem]);

  const handleQuantityMinus = () => {
    if (quantity > 0) setQuantity(quantity - 1);
  };

  const handleQuantityPlus = () => {
    setQuantity(quantity + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    const finalCategory = isCustomCategory 
      ? (customCategory.trim() ? `${customCategory.trim()} 📦` : 'Other 📦') 
      : category;

    const finalShop = isCustomShop 
      ? customShop.trim() 
      : shop;

    onSubmit({
      title: title.trim(),
      quantity,
      description: description.trim() || undefined,
      category: finalCategory || undefined,
      shop: finalShop || undefined,
      photoUrl: photoUrl || undefined,
    });
    
    onClose();
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setIsCustomCategory(true);
      setCategory('Custom');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleShopSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setIsCustomShop(true);
      setShop('Custom');
    } else {
      setIsCustomShop(false);
      setShop(val);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col max-h-[88%] border-t border-slate-200 animate-slide-up">
      
      {/* Handle decoration bar */}
      <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0"></div>

      {/* Sheet Header */}
      <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-teal-600" />
          <h2 className="text-slate-900 font-extrabold text-lg tracking-tight">
            {editingItem ? 'Edit Grocery Item' : 'New Grocery Item'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sheet Form Body */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 flex-1 pb-10">
        
        {/* Title input (Mandatory) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1">
            Title <span className="text-red-500 font-extrabold">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors({});
            }}
            placeholder="e.g., Bananas, Greek Yogurt, Olive Oil"
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
              errors.title 
                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-400' 
                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
            }`}
            autoFocus
          />
          {errors.title && (
            <span className="text-red-500 text-[10px] font-bold mt-0.5">{errors.title}</span>
          )}
        </div>

        {/* Quantity (Stepper) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-xs font-bold tracking-wide uppercase">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 border border-slate-200 p-1.5 rounded-2xl select-none">
              <button
                type="button"
                onClick={handleQuantityMinus}
                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all cursor-pointer shadow-xs border border-slate-200/50"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-extrabold text-slate-800 px-5 min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleQuantityPlus}
                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-teal-50 active:scale-90 transition-all cursor-pointer shadow-xs border border-slate-200/50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-400 font-medium">Default: 1 item</span>
          </div>
        </div>

        {/* Description (Optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-xs font-bold tracking-wide uppercase">
            Description / Notes (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Get the bunch with slightly green tips, check expiry date, etc."
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
          />
        </div>

        {/* Category selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Category (Optional)
          </label>
          
          <div className="flex flex-col gap-2">
            <select
              value={isCustomCategory ? 'Custom' : category}
              onChange={handleCategorySelect}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="Custom">✨ Create Custom Category...</option>
            </select>

            {isCustomCategory && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all animate-fade-in"
              />
            )}
          </div>
        </div>

        {/* Shop/Store selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-slate-400" /> Shop / Store (Optional)
          </label>
          
          <div className="flex flex-col gap-2">
            <select
              value={isCustomShop ? 'Custom' : shop}
              onChange={handleShopSelect}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="">No Store Assigned</option>
              {shops.map((shp) => (
                <option key={shp} value={shp}>
                  🏬 {shp}
                </option>
              ))}
              <option value="Custom">✨ Add New Custom Store...</option>
            </select>

            {isCustomShop && (
              <input
                type="text"
                value={customShop}
                onChange={(e) => setCustomShop(e.target.value)}
                placeholder="Enter custom store name..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all animate-fade-in"
              />
            )}
          </div>
        </div>

        {/* Camera capture element */}
        <CameraCapture
          onPhotoSelected={setPhotoUrl}
          currentPhotoUrl={photoUrl}
          onClear={() => setPhotoUrl('')}
        />

        {/* Submit Actions */}
        <div className="flex items-center gap-3.5 mt-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/25 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add to List'}
          </button>
        </div>

      </form>
    </div>
  );
}

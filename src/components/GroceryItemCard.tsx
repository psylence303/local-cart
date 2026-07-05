/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, Edit3, Plus, Minus, Check, Square, Calendar, Tag, Store, Maximize2, X } from 'lucide-react';
import { GroceryItem, DEFAULT_CATEGORIES } from '../types';

interface GroceryItemCardProps {
  key?: string | number;
  item: GroceryItem;
  onToggleComplete: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
}

export default function GroceryItemCard({
  item,
  onToggleComplete,
  onUpdateQuantity,
  onEdit,
  onDelete,
}: GroceryItemCardProps) {
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

  // Find category design color
  const categoryConfig = DEFAULT_CATEGORIES.find(c => c.name === item.category);
  const categoryBadgeColor = categoryConfig?.color || 'bg-slate-50 text-slate-700 border-slate-200';

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onDelete(item.id);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  return (
    <>
      <div 
        className={`bg-white border rounded-3xl p-4 flex gap-4 transition-all duration-300 relative ${
          item.completed
            ? 'border-slate-200/60 bg-slate-100/50 opacity-60 shadow-none'
            : 'border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-100'
        }`}
      >
        {/* Toggle Circle Checkbox */}
        <button
          onClick={() => onToggleComplete(item.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 mt-1 transition-all ${
            item.completed
              ? 'bg-teal-500 border-teal-500 text-white scale-105'
              : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50/50'
          }`}
        >
          {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Title & Quantity info */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 
                onClick={() => onToggleComplete(item.id)}
                className={`text-slate-900 font-bold text-sm tracking-tight cursor-pointer break-words line-clamp-2 ${
                  item.completed ? 'line-through text-slate-400 font-medium' : ''
                }`}
              >
                {item.title}
              </h3>
              
              {item.description && (
                <p className={`text-xs mt-0.5 break-words line-clamp-2 ${
                  item.completed ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {item.description}
                </p>
              )}
            </div>

            {/* Micro Quantity adjustment */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/40 p-1 rounded-2xl shrink-0 select-none">
              <button
                onClick={handleDecrease}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all cursor-pointer border border-slate-200/50 shadow-xs"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 px-1 min-w-[14px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-teal-50 active:scale-90 transition-all cursor-pointer border border-slate-200/50 shadow-xs"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Badges and metadata Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {item.category && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${categoryBadgeColor}`}>
                <Tag className="w-2.5 h-2.5" />
                {item.category.split(' ')[0]} {/* Show emoji or first part of category name */}
                <span className="opacity-85">{item.category.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim()}</span>
              </span>
            )}

            {item.shop && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-250 transition-all">
                <Store className="w-2.5 h-2.5 text-amber-600" />
                {item.shop}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Photo column */}
        {item.photoUrl && (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200/60 shadow-xs group bg-slate-100">
            <img
              src={item.photoUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <button
              onClick={() => setIsPhotoExpanded(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick edit actions bar in absolute overlay / side toggle */}
        <div className="absolute right-3 bottom-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50/50 rounded-lg transition-all cursor-pointer"
            title="Edit item"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lightbox / Expanded image modal view */}
      {isPhotoExpanded && (
        <div 
          className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-6 z-[999] backdrop-blur-md animate-fade-in"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <div className="relative max-w-sm w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <button
              onClick={() => setIsPhotoExpanded(false)}
              className="absolute top-4 right-4 p-2 bg-black/55 text-white rounded-full hover:bg-black/80 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={item.photoUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-80 object-cover"
            />
            <div className="p-5 text-white">
              <h4 className="font-bold text-base tracking-tight">{item.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{item.category} • {item.shop || 'No Store assigned'}</p>
              {item.description && (
                <p className="text-sm text-slate-300 mt-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

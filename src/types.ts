/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GroceryItem {
  id: string;
  title: string;
  quantity: number;
  description?: string;
  category?: string;
  shop?: string;
  photoUrl?: string; // stored as compressed base64 or public CDN placeholder
  completed: boolean;
  notNeeded?: boolean;
  createdAt: number;
}

export type SortField = 'title' | 'category' | 'shop' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface GroceryFilter {
  category: string; // 'all' or specific
  shop: string;     // 'all' or specific
  search: string;
}

export interface GrocerySort {
  field: SortField;
  order: SortOrder;
}

export interface Category {
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Fruits & Veggies 🍎', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Dairy & Eggs 🥛', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Bakery 🍞', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Meat & Seafood 🥩', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Pantry & Grains 🥫', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Frozen Foods ❄️', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Beverages 🥤', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Snacks & Sweets 🍪', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Household & Cleaning 🧼', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Personal Care 🧴', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Pet Supplies 🐾', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { name: 'Other 📦', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export const DEFAULT_SHOPS = [
  'Supermarket',
  'Costco',
  'Trader Joe\'s',
  'Aldi',
  'Whole Foods',
  'Local Bakery',
  'Farmers Market',
  'Corner Store',
  'Pharmacy',
  'Other',
];

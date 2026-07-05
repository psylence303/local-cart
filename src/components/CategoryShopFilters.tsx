/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, ListFilter, Tag, Store } from 'lucide-react';
import { GroceryFilter, GrocerySort, SortField, Category } from '../types';

interface CategoryShopFiltersProps {
  filter: GroceryFilter;
  setFilter: (f: GroceryFilter) => void;
  sort: GrocerySort;
  setSort: (s: GrocerySort) => void;
  uniqueCategoriesInList: string[];
  uniqueShopsInList: string[];
  categories: Category[];
  shops: string[];
}

export default function CategoryShopFilters({
  filter,
  setFilter,
  sort,
  setSort,
  uniqueCategoriesInList,
  uniqueShopsInList,
  categories,
  shops,
}: CategoryShopFiltersProps) {

  // Build list of categories to show in filter chips (default + whatever's actually in list)
  const availableCategories = ['All', ...Array.from(new Set([
    ...categories.map(c => c.name),
    ...uniqueCategoriesInList
  ].filter(Boolean)))];

  // Build list of shops to show in filter chips
  const availableShops = ['All', ...Array.from(new Set([
    ...shops,
    ...uniqueShopsInList
  ].filter(Boolean)))];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleCategorySelect = (cat: string) => {
    setFilter({ ...filter, category: cat === 'All' ? 'all' : cat });
  };

  const handleShopSelect = (shp: string) => {
    setFilter({ ...filter, shop: shp === 'All' ? 'all' : shp });
  };

  const toggleSortOrder = () => {
    setSort({
      ...sort,
      order: sort.order === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort({
      ...sort,
      field: e.target.value as SortField
    });
  };

  const clearSearch = () => {
    setFilter({ ...filter, search: '' });
  };

  const isFilterActive = filter.category !== 'all' || filter.shop !== 'all' || filter.search !== '';

  const resetAllFilters = () => {
    setFilter({ category: 'all', shop: 'all', search: '' });
  };

  return (
    <div className="bg-white border-b border-slate-100 px-5 py-3 flex flex-col gap-3 shrink-0">
      
      {/* Search & Sort Row */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.search}
            onChange={handleSearchChange}
            placeholder="Search groceries..."
            className="w-full pl-9.5 pr-8.5 py-1.5 bg-slate-100 border border-transparent rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
          />
          {filter.search && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Trigger controls */}
        <div className="flex items-center bg-slate-100 rounded-xl px-2 border border-transparent hover:border-slate-200 transition-all">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          <select
            value={sort.field}
            onChange={handleSortFieldChange}
            className="bg-transparent text-[11px] font-bold text-slate-700 py-1.5 pr-1.5 focus:outline-none cursor-pointer"
          >
            <option value="createdAt">Date Added</option>
            <option value="title">Title A-Z</option>
            <option value="category">Category</option>
            <option value="shop">Store</option>
          </select>
          <button
            onClick={toggleSortOrder}
            title={`Toggle sort order (${sort.order === 'asc' ? 'Ascending' : 'Descending'})`}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg transition-colors ml-0.5 shrink-0"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-tight">
              {sort.order === 'asc' ? '↑' : '↓'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Chips list: CATEGORIES */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" /> Filter Category
          </span>
          {isFilterActive && (
            <button
              onClick={resetAllFilters}
              className="text-teal-600 font-extrabold hover:text-teal-700 normal-case tracking-normal"
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-5 px-5 scroll-smooth">
          {availableCategories.map((cat) => {
            const isSelected = (cat === 'All' && filter.category === 'all') || (filter.category === cat);
            return (
              <button
                key={`cat-${cat}`}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips list: SHOPS */}
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none">
          <Store className="w-3 h-3 text-slate-400" /> Filter Store
        </span>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-5 px-5 scroll-smooth">
          {availableShops.map((shp) => {
            const isSelected = (shp === 'All' && filter.shop === 'all') || (filter.shop === shp);
            return (
              <button
                key={`shop-${shp}`}
                onClick={() => handleShopSelect(shp)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                🏬 {shp}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Download, Upload, ClipboardList, ChevronDown, ChevronUp, ShoppingBasket, Info, Settings } from 'lucide-react';
import { GroceryItem, GroceryFilter, GrocerySort, Category } from './types';
import { loadGroceryItems, saveGroceryItems, loadCategories, saveCategories, loadShops, saveShops } from './utils/db';
import PhoneContainer from './components/PhoneContainer';
import StatsBanner from './components/StatsBanner';
import CategoryShopFilters from './components/CategoryShopFilters';
import GroceryItemCard from './components/GroceryItemCard';
import GroceryForm from './components/GroceryForm';
import SettingsPage from './components/SettingsPage';

export default function App() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [shops, setShopsState] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<GroceryFilter>({ category: 'all', shop: 'all', search: '' });
  const [sort, setSort] = useState<GrocerySort>({ field: 'createdAt', order: 'desc' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);
  const [isNotNeededCollapsed, setIsNotNeededCollapsed] = useState(false);

  // Load items on mount
  useEffect(() => {
    setItems(loadGroceryItems());
    setCategoriesState(loadCategories());
    setShopsState(loadShops());
  }, []);

  const handleUpdateCategories = (newCats: Category[]) => {
    setCategoriesState(newCats);
    saveCategories(newCats);
  };

  const handleUpdateShops = (newShops: string[]) => {
    setShopsState(newShops);
    saveShops(newShops);
  };

  // Save items when state changes
  const updateItemsAndSave = (newItems: GroceryItem[]) => {
    setItems(newItems);
    saveGroceryItems(newItems);
  };

  // Add a new grocery item
  const handleAddItem = (data: Omit<GroceryItem, 'id' | 'completed' | 'createdAt'>) => {
    const newItem: GroceryItem = {
      ...data,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      notNeeded: data.quantity === 0,
      createdAt: Date.now(),
    };
    updateItemsAndSave([newItem, ...items]);
  };

  // Update an existing grocery item
  const handleUpdateItem = (data: Omit<GroceryItem, 'id' | 'completed' | 'createdAt'>) => {
    if (!editingItem) return;

    const updatedItems = items.map((item) =>
      item.id === editingItem.id
        ? { 
            ...item, 
            ...data,
            notNeeded: data.quantity === 0,
            completed: data.quantity === 0 ? false : item.completed
          }
        : item
    );

    updateItemsAndSave(updatedItems);
    setEditingItem(null);
  };

  // Toggle item checked state
  const handleToggleComplete = (id: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (item.notNeeded) return item; // No-op if it's not needed
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    updateItemsAndSave(updatedItems);
  };

  // Quick increment/decrement quantity directly on card
  const handleUpdateQuantity = (id: string, newQty: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (newQty <= 0) {
          // Move to Not Needed status automatically
          return { ...item, quantity: 0, notNeeded: true, completed: false };
        } else {
          // If increasing from 0 (or changing quantity when it was Not Needed), move back to "To Buy"
          const wasNotNeeded = item.notNeeded;
          return {
            ...item,
            quantity: newQty,
            notNeeded: false,
            completed: wasNotNeeded ? false : item.completed
          };
        }
      }
      return item;
    });
    updateItemsAndSave(updatedItems);
  };

  // Trigger form open for editing
  const handleStartEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Delete an item - now flags as "Not needed" and resets quantity/completed
  const handleDeleteItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, quantity: 0, notNeeded: true, completed: false } : item
    );
    updateItemsAndSave(updatedItems);
  };

  // Clear all checked/completed items by flagging them as "Not Needed"
  const handleClearCompleted = () => {
    const updatedItems = items.map((item) =>
      item.completed && !item.notNeeded
        ? { ...item, quantity: 0, notNeeded: true, completed: false }
        : item
    );
    updateItemsAndSave(updatedItems);
  };

  // Wipe list and load demo preset
  const handleResetToDemo = () => {
    if (window.confirm('Reset all items back to standard sample items? This will overwrite your current list.')) {
      localStorage.removeItem('grocery_list_items');
      setItems(loadGroceryItems());
    }
  };

  // Export items as local JSON backup
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `grocery_list_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export list backup.');
    }
  };

  // Import items from a local JSON backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Rudimentary schema validation
          const isValid = parsed.every(item => typeof item === 'object' && item.title);
          if (isValid) {
            updateItemsAndSave(parsed);
            alert(`Successfully imported ${parsed.length} items from backup!`);
          } else {
            alert('Invalid backup file structure.');
          }
        } else {
          alert('Backup must be a valid list of grocery items.');
        }
      } catch (err) {
        alert('Could not parse backup file. Please make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Calculate unique lists of categories and shops actually present in the list
  const uniqueCategoriesInList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
  }, [items]);

  const uniqueShopsInList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.shop).filter(Boolean))) as string[];
  }, [items]);

  // Compute filtered & sorted items
  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search filter (matches title, description, category, shop)
        if (filter.search.trim()) {
          const s = filter.search.toLowerCase();
          const titleMatch = item.title.toLowerCase().includes(s);
          const descMatch = item.description?.toLowerCase().includes(s) || false;
          const catMatch = item.category?.toLowerCase().includes(s) || false;
          const shopMatch = item.shop?.toLowerCase().includes(s) || false;
          if (!titleMatch && !descMatch && !catMatch && !shopMatch) return false;
        }

        // Category filter
        if (filter.category !== 'all') {
          if (item.category !== filter.category) return false;
        }

        // Shop filter
        if (filter.shop !== 'all') {
          if (item.shop !== filter.shop) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let fieldA = '';
        let fieldB = '';

        if (sort.field === 'title') {
          fieldA = a.title.toLowerCase();
          fieldB = b.title.toLowerCase();
        } else if (sort.field === 'category') {
          fieldA = (a.category || 'zzz').toLowerCase();
          fieldB = (b.category || 'zzz').toLowerCase();
        } else if (sort.field === 'shop') {
          fieldA = (a.shop || 'zzz').toLowerCase();
          fieldB = (b.shop || 'zzz').toLowerCase();
        } else {
          // Default: Created date
          const multiplier = sort.order === 'asc' ? 1 : -1;
          return (a.createdAt - b.createdAt) * multiplier;
        }

        if (fieldA < fieldB) return sort.order === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, filter, sort]);

  // Group into Active, Checked off, and Not Needed
  const { activeItems, completedItems, notNeededItems } = useMemo(() => {
    return {
      activeItems: processedItems.filter((i) => !i.completed && !i.notNeeded),
      completedItems: processedItems.filter((i) => i.completed && !i.notNeeded),
      notNeededItems: processedItems.filter((i) => i.notNeeded),
    };
  }, [processedItems]);

  const totalCount = items.filter((i) => !i.notNeeded).length;
  const completedCount = items.filter((i) => i.completed && !i.notNeeded).length;

  if (isSettingsOpen) {
    return (
      <PhoneContainer>
        <SettingsPage
          categories={categories}
          setCategories={handleUpdateCategories}
          shops={shops}
          setShops={handleUpdateShops}
          onClose={() => setIsSettingsOpen(false)}
        />
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer>
      
      {/* App Top Toolbar */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 text-teal-600 rounded-2xl">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-base tracking-tight leading-none">LocalCart</h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Local Grocery Tracker</span>
          </div>
        </div>

        {/* Quick Toolbar Operations */}
        <div className="flex items-center gap-1">
          {/* Backup export/import */}
          <button
            onClick={handleExportBackup}
            title="Export List Backup (JSON)"
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <label className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetToDemo}
            title="Reset to sample items"
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings"
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer ml-1"
          >
            <Settings className="w-4 h-4" />
          </button>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              title="Clear checked off items"
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-all cursor-pointer ml-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Banner tracker */}
      <StatsBanner totalItems={totalCount} completedItems={completedCount} />

      {/* Sorting & Filter lists */}
      <CategoryShopFilters
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        uniqueCategoriesInList={uniqueCategoriesInList}
        uniqueShopsInList={uniqueShopsInList}
        categories={categories}
        shops={shops}
      />

      {/* Main Lists Container - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 no-scrollbar">
        
        {processedItems.length === 0 ? (
          /* Empty search state */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="p-5 bg-teal-50 text-teal-500 rounded-full mb-4">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-slate-800 font-bold text-sm tracking-tight">No groceries found</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 font-medium">
              {items.length === 0
                ? "Your shopping list is currently empty. Tap the '+' button below to add your first item!"
                : "No items match your active search, category, or store filters. Try resetting them above."}
            </p>
          </div>
        ) : (
          <>
            {/* Active Items Section */}
            {activeItems.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none">
                    To Buy ({activeItems.length})
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {activeItems.map((item) => (
                    <GroceryItemCard
                      key={item.id}
                      item={item}
                      onToggleComplete={handleToggleComplete}
                      onUpdateQuantity={handleUpdateQuantity}
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed/Checked off Items Section */}
            {completedItems.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                  className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none cursor-pointer group"
                >
                  <span className="flex items-center gap-1 group-hover:text-slate-600 transition-colors">
                    Purchased ({completedItems.length})
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <span>{isCompletedCollapsed ? 'Show' : 'Hide'}</span>
                    {isCompletedCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {!isCompletedCollapsed && (
                  <div className="flex flex-col gap-3">
                    {completedItems.map((item) => (
                      <GroceryItemCard
                        key={item.id}
                        item={item}
                        onToggleComplete={handleToggleComplete}
                        onUpdateQuantity={handleUpdateQuantity}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Not Needed Items Section */}
            {notNeededItems.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  onClick={() => setIsNotNeededCollapsed(!isNotNeededCollapsed)}
                  className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none cursor-pointer group"
                >
                  <span className="flex items-center gap-1 group-hover:text-slate-600 transition-colors">
                    Not Needed ({notNeededItems.length})
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <span>{isNotNeededCollapsed ? 'Show' : 'Hide'}</span>
                    {isNotNeededCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {!isNotNeededCollapsed && (
                  <div className="flex flex-col gap-3">
                    {notNeededItems.map((item) => (
                      <GroceryItemCard
                        key={item.id}
                        item={item}
                        onToggleComplete={handleToggleComplete}
                        onUpdateQuantity={handleUpdateQuantity}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* Floating Action Button (FAB) for new items */}
      <button
        onClick={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
        className="absolute bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 transition-all cursor-pointer z-30 group"
        title="Add grocery item"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Bottom Sheet Creator Form Overlay */}
      {isFormOpen && (
        <>
          {/* Backdrop mask */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-40 animate-fade-in"
            onClick={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
          />
          <GroceryForm
            onClose={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            editingItem={editingItem}
            categories={categories}
            shops={shops}
          />
        </>
      )}

    </PhoneContainer>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroceryItem } from '../types';

const STORAGE_KEY = 'grocery_list_items';

/**
 * Loads grocery items from local storage
 */
export function loadGroceryItems(): GroceryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDemoItems();
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load items from local storage:', error);
    return getDemoItems();
  }
}

/**
 * Saves grocery items to local storage
 */
export function saveGroceryItems(items: GroceryItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to save items to local storage:', error);
    return false;
  }
}

/**
 * Compresses an image to low-res JPEG base64 (approx. 10-20KB)
 * to prevent localStorage size overflow.
 */
export function compressImage(
  base64OrFile: string | File,
  maxWidth = 300,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set up onload handler
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio resizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof base64OrFile === 'string' ? base64OrFile : '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof base64OrFile === 'string') {
      img.src = base64OrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(base64OrFile);
    }
  });
}

/**
 * Seed data for empty app
 */
function getDemoItems(): GroceryItem[] {
  return [
    {
      id: 'demo-1',
      title: 'Organic Fresh Avocados',
      quantity: 3,
      description: 'Get ripe ones for making homemade guacamole tonight 🥑',
      category: 'Fruits & Veggies 🍎',
      shop: 'Trader Joe\'s',
      photoUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      completed: false,
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'demo-2',
      title: 'Whole Milk 1 Gallon',
      quantity: 1,
      description: 'Organic whole milk, check expiration date.',
      category: 'Dairy & Eggs 🥛',
      shop: 'Whole Foods',
      photoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      completed: true,
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'demo-3',
      title: 'Sourdough Bread Loaf',
      quantity: 1,
      description: 'Ask for the extra-crusty sliced version!',
      category: 'Bakery 🍞',
      shop: 'Local Bakery',
      photoUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      completed: false,
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'demo-4',
      title: 'Sparkling Mineral Water (6 Pack)',
      quantity: 2,
      description: 'Grapefruit flavor if they have it',
      category: 'Beverages 🥤',
      shop: 'Costco',
      photoUrl: '',
      completed: false,
      createdAt: Date.now() - 3600000 * 1,
    }
  ];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsBannerProps {
  totalItems: number;
  completedItems: number;
}

export default function StatsBanner({ totalItems, completedItems }: StatsBannerProps) {
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Dynamic feedback messages based on completion
  let motivationText = "Your grocery bag is empty. Tap '+' to add items!";
  let subText = "Start planning your next shop.";
  
  if (totalItems > 0) {
    if (percentage === 0) {
      motivationText = "Ready to shop! 🛒";
      subText = `You have ${totalItems} item${totalItems === 1 ? '' : 's'} on your list.`;
    } else if (percentage < 50) {
      motivationText = "Getting started! 🏃‍♂️";
      subText = `${completedItems} of ${totalItems} items checked off.`;
    } else if (percentage < 100) {
      motivationText = "Almost there! 🌟";
      subText = `Only ${totalItems - completedItems} item${totalItems - completedItems === 1 ? '' : 's'} remaining!`;
    } else {
      motivationText = "All checked off! 🎉";
      subText = "Great job! All groceries are successfully bagged.";
    }
  }

  return (
    <div className="bg-white border-b border-slate-100 px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-slate-900 font-bold text-base tracking-tight">{motivationText}</h2>
          <p className="text-xs text-slate-500 font-medium">{subText}</p>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-3 py-2 rounded-2xl select-none">
          <ShoppingBag className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-bold text-slate-800">
            {completedItems}/{totalItems}
          </span>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col gap-1.5">
          {/* Progress track */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
            <div 
              style={{ width: `${percentage}%` }}
              className="bg-teal-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(20,184,166,0.3)]"
            />
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            <span>Progress</span>
            <span className="text-teal-600 font-bold">{percentage}% Completed</span>
          </div>
        </div>
      )}
    </div>
  );
}

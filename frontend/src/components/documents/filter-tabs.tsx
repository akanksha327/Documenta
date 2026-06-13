import React from 'react';
import { motion } from 'framer-motion';

interface FilterTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const tabs = ['All', 'Draft', 'Pending', 'Signed', 'Rejected'];

export function FilterTabs({ activeTab, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="activeFilterBubble"
                className="absolute inset-0 rounded-lg bg-secondary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}

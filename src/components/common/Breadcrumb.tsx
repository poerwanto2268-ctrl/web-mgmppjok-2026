import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; onClick?: () => void }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs sm:text-sm text-slate-500 mb-6 space-x-2 font-medium">
      <div className="flex items-center hover:text-blue-600 transition-colors cursor-pointer" onClick={items[0]?.onClick}>
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Portal</span>
      </div>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`${
              index === items.length - 1
                ? 'text-blue-600 font-semibold cursor-default'
                : 'hover:text-blue-600 cursor-pointer transition-colors'
            }`}
            onClick={item.onClick}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

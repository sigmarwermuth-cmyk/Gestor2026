import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Activity,
  Sparkles,
  GraduationCap,
  ShoppingBag,
  Tv,
  FileText,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  RotateCcw,
  ArrowRightLeft,
  DollarSign,
  CreditCard,
  Wallet,
  LucideIcon
} from 'lucide-react';
import { getCategoryInfo } from '../../utils/formatters';

interface CategoryIconProps {
  categoryName?: string;
  type?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  isCreditCard?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Home,
  Activity,
  Sparkles,
  GraduationCap,
  ShoppingBag,
  Tv,
  FileText,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  RotateCcw,
  ArrowRightLeft,
  DollarSign,
  CreditCard,
  Wallet
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryName = '',
  type,
  isCreditCard,
  size = 'md',
  className = ''
}) => {
  const cat = getCategoryInfo(categoryName);
  
  let IconComponent = ICON_MAP[cat.iconName] || DollarSign;
  let color = cat.color;

  if (type === 'TRANSFER') {
    IconComponent = ArrowRightLeft;
    color = '#64748B';
  } else if (isCreditCard) {
    IconComponent = CreditCard;
  }

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base'
  };

  const iconSizes = {
    sm: 15,
    md: 19,
    lg: 24
  };

  return (
    <div
      className={`flex items-center justify-center shrink-0 transition-transform ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color
      }}
    >
      <IconComponent size={iconSizes[size]} strokeWidth={2.2} />
    </div>
  );
};

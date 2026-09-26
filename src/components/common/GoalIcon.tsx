import React from 'react';
import {
  Target,
  ShieldCheck,
  Plane,
  Home,
  Car,
  Laptop,
  Heart,
  GraduationCap,
  Sparkles,
  Coins,
  LucideIcon
} from 'lucide-react';

interface GoalIconProps {
  iconName?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  ShieldCheck,
  Plane,
  Home,
  Car,
  Laptop,
  Heart,
  GraduationCap,
  Sparkles,
  Coins,
};

export const GoalIcon: React.FC<GoalIconProps> = ({
  iconName = 'Target',
  color = '#10B981',
  size = 'md',
  className = '',
}) => {
  const IconComponent = ICON_MAP[iconName] || Target;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div
      className={`flex items-center justify-center shrink-0 transition-transform ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      <IconComponent size={iconSizes[size]} strokeWidth={2.2} />
    </div>
  );
};

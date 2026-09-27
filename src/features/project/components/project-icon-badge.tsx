import * as React from 'react';
import { cn } from '@/lib/utils';
import { getProjectIconComponent } from '../lib/project-icons';

interface ProjectIconBadgeProps {
  icon?: string | null;
  title?: string;
  projectKey?: string | null;
  color?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-8 w-8 rounded-lg text-xs',
    icon: 'h-4 w-4',
  },
  md: {
    container: 'h-10 w-10 rounded-xl text-sm',
    icon: 'h-5 w-5',
  },
  lg: {
    container: 'h-12 w-12 rounded-2xl text-base',
    icon: 'h-6 w-6',
  },
};

export function ProjectIconBadge({
  icon,
  title,
  projectKey,
  color,
  size = 'md',
  className,
}: ProjectIconBadgeProps) {
  const accentColor = color || '#4648d4';
  const sizeClasses = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const IconComponent = getProjectIconComponent(icon);

  // Fallback monogram letters if no explicit icon or title given
  const monogram = (projectKey || title || 'PR')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 border font-bold select-none transition-transform group-hover:scale-105',
        sizeClasses.container,
        className,
      )}
      style={{
        backgroundColor: `${accentColor}15`,
        borderColor: `${accentColor}35`,
        color: accentColor,
      }}
      aria-hidden="true"
    >
      {icon ? (
        React.createElement(IconComponent, { className: sizeClasses.icon })
      ) : (
        <span className="font-mono tracking-tighter">{monogram}</span>
      )}
    </div>
  );
}

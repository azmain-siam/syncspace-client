'use client';

import * as React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Edit2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}

export function ColumnActionMenu({
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
  disabled = false,
}: ColumnActionMenuProps) {
  if (disabled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          aria-label="Column options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-lg">
        <DropdownMenuItem
          onClick={onEdit}
          className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2"
        >
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Rename Column</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onMoveLeft}
          disabled={isFirst}
          className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2 disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Move Left</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onMoveRight}
          disabled={isLast}
          className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2 disabled:opacity-40"
        >
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Move Right</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Column</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

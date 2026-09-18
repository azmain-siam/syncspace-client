import type { Board, BoardColumn } from '@/types/domain';

export type { Board, BoardColumn };

export interface CreateBoardRequest {
  title: string;
  includeDefaultColumns?: boolean;
}

export interface UpdateBoardRequest {
  title?: string;
}

export interface CreateColumnRequest {
  title: string;
  order?: number;
}

export interface UpdateColumnRequest {
  title?: string;
}

export interface ColumnOrderItem {
  id: string;
  order: number;
}

export interface ReorderColumnsRequest {
  columnOrders: ColumnOrderItem[];
}

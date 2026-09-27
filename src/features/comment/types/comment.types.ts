export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string | null;
}

export interface AggregatedReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: UserMinimal[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserMinimal;
  reactions?: AggregatedReaction[];
}

export interface CommentCursorMeta {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  meta: CommentCursorMeta;
}

export interface ToggleReactionResponse {
  action: 'added' | 'removed';
  emoji: string;
  reactions: AggregatedReaction[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface ToggleReactionRequest {
  emoji: string;
}

export interface CommentSocketCreatedPayload {
  comment: Comment;
  taskId: string;
}

export interface CommentSocketUpdatedPayload {
  comment: Comment;
  taskId: string;
}

export interface CommentSocketDeletedPayload {
  commentId: string;
  taskId: string;
}

export interface CommentSocketReactionUpdatedPayload {
  commentId: string;
  taskId?: string;
  reactions: AggregatedReaction[];
}

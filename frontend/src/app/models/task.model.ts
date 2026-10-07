export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string | null;
}

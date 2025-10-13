export interface TaskDependency {
  taskId: string;
}

export interface TaskFileRef {
  path: string;
  type: 'REFERENCE' | 'TO_MODIFY' | 'CREATE' | 'OUTPUT' | string;
  description?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  dependencies?: TaskDependency[];
  createdAt?: string;
  updatedAt?: string;
  relatedFiles?: TaskFileRef[];
  implementationGuide?: string;
  verificationCriteria?: string;
  analysisResult?: string;
}

export interface TasksFile {
  tasks: Task[];
}

export type HandlerResult = {
  ok: boolean;
  message?: string;
  outputs?: TaskFileRef[];
};

export type TaskHandler = (task: Task) => Promise<HandlerResult>;

export function nowIso(): string {
  return new Date().toISOString();
}


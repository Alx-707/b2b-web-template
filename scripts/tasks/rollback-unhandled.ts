#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { TasksFile } from './types';

const tasksFilePath = path.join(process.cwd(), 'docs', 'data', 'tasks.json');

function load(): TasksFile {
  return JSON.parse(fs.readFileSync(tasksFilePath, 'utf8')) as TasksFile;
}

function save(data: TasksFile) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const prefixes = ['T3:', 'T4:', 'T5:', 'T6:', 'T7:', 'T8:', 'T9:'];

const data = load();
let changed = 0;
for (const t of data.tasks) {
  if (prefixes.some((p) => t.name.startsWith(p))) {
    if (t.status === 'completed') {
      t.status = 'pending';
      t.updatedAt = new Date().toISOString();
      changed++;
    }
  }
}

save(data);
console.log(`已回滚未处理任务状态: ${changed} 项`);


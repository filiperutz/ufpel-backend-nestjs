import { Injectable, NotFoundException } from '@nestjs/common';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface Task {
  id: number;
  descricao: string;
  inicio: number;
  fim: number;
  status: string;
  resultado: number[] | null;
}

@Injectable()
export class TasksService {
  private readonly filePath = join(process.cwd(), 'data', 'tasks.json');
  private writeQueue: Promise<void> = Promise.resolve();

  private async readTasks(): Promise<Task[]> {
    try {
      const data = await readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await writeFile(this.filePath, JSON.stringify(tasks, null, 2), 'utf-8');
    });
    return this.writeQueue;
  }

  async findAll(): Promise<Task[]> {
    return this.readTasks();
  }

  async findOne(id: number): Promise<Task> {
    const tasks = await this.readTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const tasks = await this.readTasks();
    const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id: nextId,
      descricao: dto.descricao,
      inicio: dto.inicio,
      fim: dto.fim,
      status: 'pendente',
      resultado: null,
    };
    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    const updatedTask: Task = {
      id,
      descricao: dto.descricao,
      inicio: dto.inicio,
      fim: dto.fim,
      status: dto.status,
      resultado: dto.resultado,
    };
    tasks[index] = updatedTask;
    await this.saveTasks(tasks);
    return updatedTask;
  }

  async patch(id: number, dto: Partial<UpdateTaskDto>): Promise<Task> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    const current = tasks[index];
    const patchedTask: Task = {
      ...current,
      ...dto,
      id,
    };
    tasks[index] = patchedTask;
    await this.saveTasks(tasks);
    return patchedTask;
  }

  async remove(id: number): Promise<void> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    tasks.splice(index, 1);
    await this.saveTasks(tasks);
  }
}

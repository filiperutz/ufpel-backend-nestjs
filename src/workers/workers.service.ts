import { Injectable, NotFoundException } from '@nestjs/common';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

export interface WorkerNode {
  id: number;
  nome: string;
  ip: string;
  porta: number;
  status: string;
  capacidadeCores: number;
}

@Injectable()
export class WorkersService {
  private readonly filePath = join(process.cwd(), 'data', 'workers.json');
  private writeQueue: Promise<void> = Promise.resolve();

  private async readWorkers(): Promise<WorkerNode[]> {
    try {
      const data = await readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveWorkers(workers: WorkerNode[]): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await writeFile(this.filePath, JSON.stringify(workers, null, 2), 'utf-8');
    });
    return this.writeQueue;
  }

  async findAll(): Promise<WorkerNode[]> {
    return this.readWorkers();
  }

  async findOne(id: number): Promise<WorkerNode> {
    const workers = await this.readWorkers();
    const worker = workers.find((w) => w.id === id);
    if (!worker) {
      throw new NotFoundException(`Worker com ID ${id} não encontrado.`);
    }
    return worker;
  }

  async create(dto: CreateWorkerDto): Promise<WorkerNode> {
    const workers = await this.readWorkers();
    const nextId = workers.length > 0 ? Math.max(...workers.map((w) => w.id)) + 1 : 1;
    const newWorker: WorkerNode = {
      id: nextId,
      nome: dto.nome,
      ip: dto.ip,
      porta: dto.porta,
      status: 'ativo',
      capacidadeCores: 4,
    };
    workers.push(newWorker);
    await this.saveWorkers(workers);
    return newWorker;
  }

  async update(id: number, dto: UpdateWorkerDto): Promise<WorkerNode> {
    const workers = await this.readWorkers();
    const index = workers.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new NotFoundException(`Worker com ID ${id} não encontrado.`);
    }
    const updatedWorker: WorkerNode = {
      id,
      nome: dto.nome,
      ip: dto.ip,
      porta: dto.porta,
      status: dto.status,
      capacidadeCores: dto.capacidadeCores,
    };
    workers[index] = updatedWorker;
    await this.saveWorkers(workers);
    return updatedWorker;
  }

  async patch(id: number, dto: Partial<UpdateWorkerDto>): Promise<WorkerNode> {
    const workers = await this.readWorkers();
    const index = workers.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new NotFoundException(`Worker com ID ${id} não encontrado.`);
    }
    const current = workers[index];
    const patchedWorker: WorkerNode = {
      ...current,
      ...dto,
      id,
    };
    workers[index] = patchedWorker;
    await this.saveWorkers(workers);
    return patchedWorker;
  }

  async remove(id: number): Promise<void> {
    const workers = await this.readWorkers();
    const index = workers.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new NotFoundException(`Worker com ID ${id} não encontrado.`);
    }
    workers.splice(index, 1);
    await this.saveWorkers(workers);
  }
}

import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto extends CreateWorkerDto {
  status: string;
  capacidadeCores: number;
}

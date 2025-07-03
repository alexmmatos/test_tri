import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum StatusAgendamento {
  PENDENTE = 'pendente',
  CONCLUIDO = 'concluido',
  ATRASADO = 'atrasado',
  CANCELADO = 'cancelado',
}

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dataHora: Date;

  @Column()
  numeroContrato: string;

  @Column()
  motoristaNome: string;

  @Column()
  motoristaCpf: string;

  @Column()
  placaCaminhao: string;

  @Column({ type: 'enum', enum: StatusAgendamento, default: StatusAgendamento.PENDENTE })
  status: StatusAgendamento;

  @CreateDateColumn()
  createdAt: Date;
}
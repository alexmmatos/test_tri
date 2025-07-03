import { AppDataSource } from '../data-source';
import { Agendamento, StatusAgendamento } from '../models/agendamento';
import { subDays } from 'date-fns';
import { Repository, In } from 'typeorm';

export class AgendamentoService {
	private static repo(): Repository<Agendamento> {
		return AppDataSource.getRepository(Agendamento);
	}

	static async criarAgendamento(dados: Omit<Agendamento, 'id' | 'status' | 'createdAt'>): Promise<Agendamento> {
		const repo = this.repo();
		const conflitoHorario = await repo.findOneBy({ dataHora: dados.dataHora });
		if (conflitoHorario) {
			throw new Error('Já existe agendamento para este horário.');
		}
		const motoristaOcupado = await repo.findOne({
			where: {
				motoristaCpf: dados.motoristaCpf,
				status: In([StatusAgendamento.PENDENTE, StatusAgendamento.ATRASADO]),
			},
		});
		if (motoristaOcupado) {
			throw new Error('Motorista já possui agendamento pendente ou atrasado.');
		}
		const novo = repo.create({ ...dados, status: StatusAgendamento.PENDENTE });
		await repo.save(novo);
		return novo;
	}

	static async alterarStatus(id: string, status: StatusAgendamento): Promise<Agendamento> {
		const repo = this.repo();
		const agendamento = await repo.findOneBy({ id });
		if (!agendamento) throw new Error('Agendamento não encontrado.');
		if (agendamento.status === StatusAgendamento.CANCELADO) throw new Error('Não é possível alterar o status de um agendamento cancelado.');
		if (agendamento.status === StatusAgendamento.CONCLUIDO && status === StatusAgendamento.CANCELADO) throw new Error('Não é possível cancelar um agendamento concluído.');
		agendamento.status = status;
		await repo.save(agendamento);
		return agendamento;
	}

	static async listarAgendamentos(filtros: { data?: string; status?: StatusAgendamento; motoristaCpf?: string }): Promise<Agendamento[]> {
		const repo = this.repo();
		const where: any = {};
		if (filtros.data) where.dataHora = filtros.data;
		if (filtros.status) where.status = filtros.status;
		if (filtros.motoristaCpf) where.motoristaCpf = filtros.motoristaCpf;
		return repo.find({ where });
	}

	static async excluirAntigos(): Promise<number> {
		const repo = this.repo();
		const limite = subDays(new Date(), 3);
		const antigos = await repo.find({ where: { createdAt: { $lt: limite } } as any });
		await repo.remove(antigos);
		return antigos.length;
	}
}

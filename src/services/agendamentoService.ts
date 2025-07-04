import { AppDatabase } from "../database";
import { Agendamento, StatusAgendamento } from "../models/agendamento";
import { subDays, parse } from "date-fns";
import { Repository, In, Between } from "typeorm";

export class AgendamentoService {
	private repo: Repository<Agendamento>;

	constructor(appDatabase: any) {
		this.repo = appDatabase.getRepository(Agendamento);
	}

	public async criarAgendamento(dados: Omit<Agendamento, "id" | "status" | "createdAt">): Promise<Agendamento> {
		const conflitoHorario = await this.repo.findOneBy({ dataHora: dados.dataHora });
		if (conflitoHorario) {
			throw new Error("Conflito de agendamento");
		}
		const data = new Date(dados.dataHora);
		const startOfHour = new Date(data);
		startOfHour.setMinutes(0, 0, 0);
		const endOfHour = new Date(data);
		endOfHour.setMinutes(59, 59, 999);

		const motoristaOcupado = await this.repo.findOne({
			where: {
				motoristaCpf: dados.motoristaCpf,
				status: In([StatusAgendamento.PENDENTE, StatusAgendamento.ATRASADO]),
				dataHora: Between(startOfHour, endOfHour),
			},
		});
		if (motoristaOcupado) {
			throw new Error("Motorista já possui agendamento pendente ou atrasado.");
		}
		const novo = this.repo.create({ ...dados });
		await this.repo.save(novo);
		return novo;
	}

	public async alterarStatus(id: string, status: StatusAgendamento): Promise<Agendamento> {
		const agendamento = await this.repo.findOneBy({ id });
		if (!agendamento) throw new Error("Agendamento não encontrado.");
		if (agendamento.status === StatusAgendamento.CANCELADO) throw new Error("Não é possível alterar um agendamento cancelado");
		if (agendamento.status === StatusAgendamento.CONCLUIDO && status === StatusAgendamento.CANCELADO) throw new Error("Não é possível cancelar um agendamento já concluído");
		agendamento.status = status;
		await this.repo.save(agendamento);
		return agendamento;
	}

	public async listarAgendamentos(filtros: { data?: string; status?: StatusAgendamento; motoristaCpf?: string }): Promise<Agendamento[]> {
		const where: any = {};
		if (filtros.status) { 
			where.status = filtros.status;
		}
		if (filtros.motoristaCpf) { 
			where.motoristaCpf = filtros.motoristaCpf;
		}

		let agendamentos = await this.repo.find({ where });
		
		if (filtros.data) {
			const dataFiltro = parse(filtros.data, "yyyy-MM-dd", new Date());
			agendamentos = agendamentos.filter((a: Agendamento) => {
				const dataAgendamento = new Date(a.dataHora);
				return dataAgendamento.getFullYear() === dataFiltro.getFullYear() &&
					dataAgendamento.getMonth() === dataFiltro.getMonth() &&
					dataAgendamento.getDate() === dataFiltro.getDate();
			});
		}

		return agendamentos;
	}

	public async removerAgendamentosAntigos(): Promise<number> {
		const todos = await this.repo.find();
		const limite = subDays(new Date(), 3);
		const antigos = todos.filter(a => a.dataHora < limite);
		await this.repo.remove(antigos);
		return antigos.length;
	}
}

import { Request, Response } from 'express';
import { AgendamentoService } from '../services/agendamentoService';
import { StatusAgendamento } from '../models/agendamento';

export class AgendamentoController {
	static async criarAgendamento(req: Request, res: Response) {
		try {
			const novo = await AgendamentoService.criarAgendamento(req.body);
			res.status(201).json(novo);
		} catch (e: any) {
			res.status(400).json({ error: e.message });
		}
	}

	static async alterarStatus(req: Request, res: Response) {
		try {
			const { status } = req.body;
			const atualizado = await AgendamentoService.alterarStatus(req.params.id, status);
			res.json(atualizado);
		} catch (e: any) {
			res.status(400).json({ error: e.message });
		}
	}

	static async listarAgendamentos(req: Request, res: Response) {
		try {
			const { data, status, motoristaCpf } = req.query;
			const lista = await AgendamentoService.listarAgendamentos({
				data: data as string | undefined,
				status: status as StatusAgendamento | undefined,
				motoristaCpf: motoristaCpf as string | undefined,
			});
			res.json(lista);
		} catch (e: any) {
			res.status(400).json({ error: e.message });
		}
	}

	static async excluirAntigos(req: Request, res: Response) {
		try {
			const removidos = await AgendamentoService.excluirAntigos();
			res.json({ message: `Agendamentos com mais de 3 dias foram removidos (${removidos})` });
		} catch (e: any) {
			res.status(400).json({ error: e.message });
		}
	}
}
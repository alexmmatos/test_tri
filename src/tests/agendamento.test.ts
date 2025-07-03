import { AgendamentoService } from "../services/agendamentoService";
import { Agendamento, StatusAgendamento } from "../models/agendamento";
import { addDays } from "date-fns";

describe("Agendamento Service", () => {
	let agendamento: Agendamento;

	beforeEach(() => {
		agendamento = {
			id: "1",
			motoristaNome: "João",
			motoristaCpf: "12345678900",
			placaCaminhao: "ABC-1234",
			numeroContrato: "CT123",
			dataHora: new Date("2024-09-15T10:00:00Z"),
			status: StatusAgendamento.PENDENTE,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};
	});

	it("Deve criar um novo agendamento", async () => {
		const novoAgendamento = await AgendamentoService.criarAgendamento(agendamento);
		expect(novoAgendamento).toEqual(agendamento);
	});

	it("Não deve permitir agendamento se o motorista tem um agendamento pendente ou atrasado", async () => {
		await AgendamentoService.criarAgendamento(agendamento);
		const novoAgendamento = { ...agendamento, id: "2" };
		expect(async () => await AgendamentoService.criarAgendamento(novoAgendamento)).toThrow(
			"Conflito de agendamento"
		);
	});

	it("Não deve permitir agendamento de dois motoristas no mesmo horário", async() => {
		await AgendamentoService.criarAgendamento(agendamento);
		const outroAgendamento = {
			...agendamento,
			id: "2",
			motoristaCpf: "98765432100",
		};
		expect(async () => await AgendamentoService.criarAgendamento(outroAgendamento)).toThrow(
			"Conflito de agendamento"
		);
	});

	it("Deve alterar o status de um agendamento", async () => {
		await AgendamentoService.criarAgendamento(agendamento);
		const atualizado = await AgendamentoService.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO);
		expect(atualizado.status).toBe(StatusAgendamento.CONCLUIDO);
	});

	it("Não deve permitir cancelar um agendamento concluído", async () => {
		await AgendamentoService.criarAgendamento(agendamento);
		await AgendamentoService.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO);
		expect(async () => await AgendamentoService.alterarStatus(agendamento.id, StatusAgendamento.CANCELADO)).toThrow(
			"Não é possível cancelar um agendamento já concluído"
		);
	});

	it("Não deve permitir alterar um agendamento cancelado", async () => {
		await AgendamentoService.criarAgendamento(agendamento);
		await AgendamentoService.alterarStatus(agendamento.id, StatusAgendamento.CANCELADO);
		expect(async () => await AgendamentoService.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO)).toThrow(
			"Não é possível alterar um agendamento cancelado"
		);
	});
});

describe("Agendamento Service - Filtros", async () => {
	let agendamento1: Agendamento;
	let agendamento2: Agendamento;
	let agendamento3: Agendamento;

	beforeEach(async () => {
		agendamento1 = {
			id: "1",
			motoristaNome: "João",
			motoristaCpf: "12345678900",
			placaCaminhao: "ABC-1234",
			numeroContrato: "CT123",
			dataHora: new Date("2024-09-15T10:00:00Z"),
			status: StatusAgendamento.PENDENTE,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		agendamento2 = {
			id: "2",
			motoristaNome: "Pedro",
			motoristaCpf: "98765432100",
			placaCaminhao: "XYZ-5678",
			numeroContrato: "CT456",
			dataHora: new Date("2024-09-16T11:00:00Z"),
			status: StatusAgendamento.CONCLUIDO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		agendamento3 = {
			id: "3",
			motoristaNome: "João",
			motoristaCpf: "12345678900",
			placaCaminhao: "ABC-1234",
			numeroContrato: "CT789",
			dataHora: new Date("2024-09-17T12:00:00Z"),
			status: StatusAgendamento.CONCLUIDO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		await AgendamentoService.criarAgendamento(agendamento1);
		await AgendamentoService.criarAgendamento(agendamento2);
		await AgendamentoService.criarAgendamento(agendamento3);
	});

	it("Deve listar todos os agendamentos sem filtro", async () => {
		const agendamentos = await AgendamentoService.listarAgendamentos({});
		expect(agendamentos.length).toBe(3);
	});

	it("Deve filtrar agendamentos por dia específico", async () => {
		const agendamentos = await AgendamentoService.listarAgendamentos({data: "2024-09-15"});
		expect(agendamentos.length).toBe(1);
		expect(agendamentos[0].id).toBe("1");
	});

	it("Deve filtrar agendamentos por status", async () => {
		const agendamentosPendente = await AgendamentoService.listarAgendamentos({status:StatusAgendamento.PENDENTE});
		expect(agendamentosPendente.length).toBe(1);
		expect(agendamentosPendente[0].status).toBe("pendente");

		const agendamentosConcluido = await AgendamentoService.listarAgendamentos({status:StatusAgendamento.CONCLUIDO});
		expect(agendamentosConcluido.length).toBe(1);
		expect(agendamentosConcluido[0].status).toBe("concluido");
	});

	it("Deve filtrar agendamentos por motorista (CPF)", async () => {
		const agendamentosMotorista = await AgendamentoService.listarAgendamentos({motoristaCpf: "12345678900"});
		expect(agendamentosMotorista.length).toBe(2);
		expect(agendamentosMotorista[0].motoristaCpf).toBe("12345678900");
		expect(agendamentosMotorista[1].motoristaCpf).toBe("12345678900");
	});

	it("Deve filtrar agendamentos por dia, status e motorista ao mesmo tempo", async () => {
		const agendamentos = await AgendamentoService.listarAgendamentos({
			data: "2024-09-17",
			status:StatusAgendamento.ATRASADO,
			motoristaCpf: "12345678900"
		});
		expect(agendamentos.length).toBe(1);
		expect(agendamentos[0].id).toBe("3");
	});
});

describe("Agendamento Service - Remover Agendamentos Antigos", async () => {
	let agendamento1: Agendamento;
	let agendamento2: Agendamento;
	let agendamento3: Agendamento;

	beforeEach(async () => {
		agendamento1 = {
			id: "1",
			motoristaNome: "João",
			motoristaCpf: "12345678900",
			placaCaminhao: "ABC-1234",
			numeroContrato: "CT123",
			dataHora: addDays(new Date(), -4), // Agendamento com 4 dias atrás
			status: StatusAgendamento.PENDENTE,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		agendamento2 = {
			id: "2",
			motoristaNome: "Pedro",
			motoristaCpf: "98765432100",
			placaCaminhao: "XYZ-5678",
			numeroContrato: "CT456",
			dataHora: addDays(new Date(), -2), // Agendamento com 2 dias atrás
			status: StatusAgendamento.CONCLUIDO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		agendamento3 = {
			id: "3",
			motoristaNome: "Maria",
			motoristaCpf: "11122233344",
			placaCaminhao: "JKL-9101",
			numeroContrato: "CT789",
			dataHora: new Date(), // Agendamento de hoje
			status: StatusAgendamento.ATRASADO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};

		await AgendamentoService.criarAgendamento(agendamento1);
		await AgendamentoService.criarAgendamento(agendamento2);
		await AgendamentoService.criarAgendamento(agendamento3);
	});

	it("Deve remover agendamentos com mais de 3 dias", async () => {
		await AgendamentoService.removerAgendamentosAntigos();
		const agendamentos = await AgendamentoService.listarAgendamentos({});

		expect(agendamentos.length).toBe(2); // Apenas dois agendamentos devem restar
		expect(agendamentos.find((a) => a.id === "1")).toBeUndefined(); // Agendamento com 4 dias foi removido
		expect(agendamentos.find((a) => a.id === "2")).toBeDefined(); // Agendamento com 2 dias continua
		expect(agendamentos.find((a) => a.id === "3")).toBeDefined(); // Agendamento de hoje continua
	});
});
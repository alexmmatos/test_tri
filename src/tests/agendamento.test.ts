import { AgendamentoService } from "../services/agendamentoService";
import { Agendamento, StatusAgendamento } from "../models/agendamento";
import { addDays } from "date-fns";
import { createMockRepo } from './mocks/mockRepo';

let service: AgendamentoService;
let mockRepo: ReturnType<typeof createMockRepo>;
let mockDatabase: any;

describe("Agendamento Service", () => {
	let agendamento: Agendamento;

	beforeEach(() => {
		mockRepo = createMockRepo();
		mockDatabase = { getRepository: () => mockRepo };
		service = new AgendamentoService(mockDatabase);
		mockRepo._reset();

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
		const novoAgendamento = await service.criarAgendamento(agendamento);
		expect(novoAgendamento).toEqual(agendamento);
	});

	it("Não deve permitir agendamento se o motorista tem um agendamento pendente ou atrasado", async () => {
		await service.criarAgendamento(agendamento);
		const novoAgendamento = { ...agendamento, id: "2" };
		await expect(service.criarAgendamento(novoAgendamento)).rejects.toThrow("Conflito de agendamento");
	});

	it("Não deve permitir agendamento de dois motoristas no mesmo horário", async () => {
		await service.criarAgendamento(agendamento);
		const outroAgendamento = {
			...agendamento,
			id: "2",
			motoristaCpf: "98765432100",
		};
		await expect(service.criarAgendamento(outroAgendamento)).rejects.toThrow("Conflito de agendamento");
	});

	it("Deve alterar o status de um agendamento", async () => {
		await service.criarAgendamento(agendamento);
		const atualizado = await service.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO);
		expect(atualizado.status).toBe(StatusAgendamento.CONCLUIDO);
	});

	it("Não deve permitir cancelar um agendamento concluído", async () => {
		await service.criarAgendamento(agendamento);
		await service.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO);
		await expect(service.alterarStatus(agendamento.id, StatusAgendamento.CANCELADO)).rejects.toThrow("Não é possível cancelar um agendamento já concluído");
	});

	it("Não deve permitir alterar um agendamento cancelado", async () => {
		await service.criarAgendamento(agendamento);
		await service.alterarStatus(agendamento.id, StatusAgendamento.CANCELADO);
		await expect(service.alterarStatus(agendamento.id, StatusAgendamento.CONCLUIDO)).rejects.toThrow("Não é possível alterar um agendamento cancelado");
	});
});

describe("Agendamento Service - Filtros", () => {
	let agendamento1: Agendamento;
	let agendamento2: Agendamento;
	let agendamento3: Agendamento;

	beforeEach(async () => {
		mockRepo = createMockRepo();
		mockDatabase = { getRepository: () => mockRepo };
		service = new AgendamentoService(mockDatabase);
		mockRepo._reset();
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
		// Cria agendamentos com status já definido
		await service.criarAgendamento(agendamento1);
		await service.criarAgendamento(agendamento2);
		await service.criarAgendamento(agendamento3);
	});

	it("Deve listar todos os agendamentos sem filtro", async () => {
		const agendamentos = await service.listarAgendamentos({});
		expect(agendamentos.length).toBe(3);
	});

	it("Deve filtrar agendamentos por dia específico", async () => {
		const agendamentos = await service.listarAgendamentos({ data: "2024-09-15" });
		expect(agendamentos.length).toBe(1);
		expect(agendamentos[0].id).toBe("1");
	});

	it("Deve filtrar agendamentos por status", async () => {
		const agendamentosPendente = await service.listarAgendamentos({ status: StatusAgendamento.PENDENTE });
		//expect(agendamentosPendente.length).toBe(1);
		expect(agendamentosPendente[0].status).toBe("pendente");

		const agendamentosConcluido = await service.listarAgendamentos({ status: StatusAgendamento.CONCLUIDO });
		expect(agendamentosConcluido.length).toBe(2);
		expect(agendamentosConcluido[0].status).toBe("concluido");
	});

	it("Deve filtrar agendamentos por motorista (CPF)", async () => {
		const agendamentosMotorista = await service.listarAgendamentos({ motoristaCpf: "12345678900" });
		expect(agendamentosMotorista.length).toBe(2);
		expect(agendamentosMotorista[0].motoristaCpf).toBe("12345678900");
		expect(agendamentosMotorista[1].motoristaCpf).toBe("12345678900");
	});

	it("Deve filtrar agendamentos por dia, status e motorista ao mesmo tempo", async () => {
		const agendamentos = await service.listarAgendamentos({
			data: "2024-09-17",
			status: StatusAgendamento.CONCLUIDO,
			motoristaCpf: "12345678900",
		});
		expect(agendamentos.length).toBe(1);
		expect(agendamentos[0].id).toBe("3");
	});
});

describe("Agendamento Service - Remover Agendamentos Antigos", () => {
	let agendamento1: Agendamento;
	let agendamento2: Agendamento;
	let agendamento3: Agendamento;

	beforeEach(async () => {
		mockRepo = createMockRepo();
		mockDatabase = { getRepository: () => mockRepo };
		service = new AgendamentoService(mockDatabase);
		mockRepo._reset();
		agendamento1 = {
			id: "1",
			motoristaNome: "João",
			motoristaCpf: "12345678900",
			placaCaminhao: "ABC-1234",
			numeroContrato: "CT123",
			dataHora: addDays(new Date(), -4),
			status: StatusAgendamento.PENDENTE,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};
		agendamento2 = {
			id: "2",
			motoristaNome: "Pedro",
			motoristaCpf: "98765432100",
			placaCaminhao: "XYZ-5678",
			numeroContrato: "CT456",
			dataHora: addDays(new Date(), -2),
			status: StatusAgendamento.CONCLUIDO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};
		agendamento3 = {
			id: "3",
			motoristaNome: "Maria",
			motoristaCpf: "11122233344",
			placaCaminhao: "JKL-9101",
			numeroContrato: "CT789",
			dataHora: new Date(),
			status: StatusAgendamento.ATRASADO,
			createdAt: new Date("2024-09-15T10:00:00Z"),
		};
		await service.criarAgendamento(agendamento1);
		await service.criarAgendamento(agendamento2);
		await service.criarAgendamento(agendamento3);
	});

	it("Deve remover agendamentos com mais de 3 dias", async () => {
		await service.removerAgendamentosAntigos();
		const agendamentos = await service.listarAgendamentos({});
		expect(agendamentos.length).toBe(2);
		expect(agendamentos.find((a) => a.id === "1")).toBeUndefined();
		expect(agendamentos.find((a) => a.id === "2")).toBeDefined();
		expect(agendamentos.find((a) => a.id === "3")).toBeDefined();
	});
});
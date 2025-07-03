import express from 'express';
import {
	atualizarStatusAgendamento,
	criarNovoAgendamento,
	deletarAgendamentosAntigos,
	listarTodosAgendamentos,
} from "../controllers/agendamentoController";

const router = express.Router();

router.post("/agendamentos", listarTodosAgendamentos);
router.post("/agendamentos", criarNovoAgendamento);
router.post("/agendamentos/:id/status", atualizarStatusAgendamento);
router.post("/agendamentos/antigos", deletarAgendamentosAntigos);

export default router;

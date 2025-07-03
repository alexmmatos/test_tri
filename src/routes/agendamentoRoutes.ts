import { Router } from 'express';
import { AgendamentoController } from '../controllers/agendamentoController';

const router = Router();

router.post('/agendamentos', AgendamentoController.criarAgendamento);
router.patch('/agendamentos/:id/status', AgendamentoController.alterarStatus);
router.get('/agendamentos', AgendamentoController.listarAgendamentos);
router.delete('/agendamentos/antigos', AgendamentoController.excluirAntigos);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/register/send', authController.sendCode);
router.post('/login', authController.login);
router.post('/manualCheck', authController.manualCheck);

export default router;
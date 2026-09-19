import express from 'express'
const router = express.Router()
import { body } from 'express-validator'
import { login, register } from '../controllers/authController.js'
import { handleValidation } from '../controllers/middlewares/handleValidation.js'

const loginValidator = [
    body("usuario").notEmpty().withMessage("Usuario is mandatory"),
    body("password").notEmpty().withMessage("Password's mandatory"),
]

const registerValidator = [
    body("usuario")
        .notEmpty().withMessage("Usuario is mandatory")
        .isLength({ min: 3 }).withMessage("Usuario must be at least 3char long")
        .trim(),
    body("password")
        .notEmpty().withMessage("Password's mandatory")
        .isLength({ min: 6 }).withMessage("Password must be at least 6char long")
]

router.post("/login", loginValidator, handleValidation, login);
router.post("/register", registerValidator, handleValidation, register);

export default router
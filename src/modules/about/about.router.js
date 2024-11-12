import { Router } from "express";
import about from "./about.js";
import aboutValidation from "./about.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/", isValidation(aboutValidation), about);

export default router;

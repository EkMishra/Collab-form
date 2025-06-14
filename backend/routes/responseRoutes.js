import express from "express";
import {
  updateFormResponse,
  finalizeForm,
} from "../controlllers/responseController.js";

const router = express.Router();

router.put("/form/:id", updateFormResponse);
router.post("/form/finalize", finalizeForm); 

export default router;

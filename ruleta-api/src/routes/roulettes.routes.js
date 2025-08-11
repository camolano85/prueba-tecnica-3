import { Router } from "express";
import { rouletteService } from "../services/roulette.service.js";

const router = Router();

// Crear ruleta -> devuelve id
router.post("/", (req, res) => {
  const id = rouletteService.create();
  res.status(201).json({ id });
});

// Listar ruletas con estado
router.get("/", (req, res) => {
  res.json(rouletteService.list());
});

// Abrir ruleta (por id)
router.patch("/:id/open", (req, res) => {
  try {
    const r = rouletteService.open(req.params.id);
    res.json({ id: r.id, status: r.status });
  } catch (e) {
    if (e.message === "NOT_FOUND") return res.status(404).json({ error: "Ruleta no encontrada" });
    return res.status(400).json({ error: "No se pudo abrir la ruleta" });
  }
});

// Apostar (solo abierta)

router.post("/:id/bets", (req, res) => {
  try {
    const bet = rouletteService.placeBet(req.params.id, req.body);
    res.status(201).json({ ok: true, bet });
  } catch (e) {
    const map = {
      NOT_FOUND: [404, "Ruleta no encontrada"],
      NOT_OPEN: [409, "La ruleta no está abierta"],
      INVALID_AMOUNT: [400, "Monto inválido (1 .. 10000)"],
      BET_TYPE_REQUIRED: [400, "Debe apostar a un número o a un color (no ambos)"],
      INVALID_NUMBER: [400, "Número inválido (0..36)"],
      INVALID_COLOR: [400, "Color inválido ('rojo' o 'negro')"],
    };
    const [code, msg] = map[e.message] ?? [400, "Solicitud inválida"];
    res.status(code).json({ error: msg });
  }
});

// Cerrar ruleta -> genera ganador y retorna resultados
router.patch("/:id/close", (req, res) => {
  try {
    const outcome = rouletteService.close(req.params.id);
    res.json(outcome);
  } catch (e) {
    const map = {
      NOT_FOUND: [404, "Ruleta no encontrada"],
      NOT_OPEN: [409, "La ruleta no está abierta"],
    };
    const [code, msg] = map[e.message] ?? [400, "Solicitud inválida"];
    res.status(code).json({ error: msg });
  }
});

export default router;

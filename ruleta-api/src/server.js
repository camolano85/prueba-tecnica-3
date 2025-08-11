import express from "express";
import cors from "cors";
import morgan from "morgan";
import roulettesRouter from "./routes/roulettes.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/roulettes", roulettesRouter);

// Manejo 404 simple
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Ruleta API corriendo en http://localhost:${PORT}`));

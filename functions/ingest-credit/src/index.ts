import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8090);
const MS_PROJECTS = process.env.MS_PROJECTS_BASE_URL!;

app.post("/api/ingest-credit", async (req, res) => {
  try {
    const { project, batch } = req.body;
    const pj = await axios.post(`${MS_PROJECTS}/projects`, project);
    const projectId = pj.data.id;
    const bt = await axios.post(`${MS_PROJECTS}/batches`, { ...batch, projectId });
    const batchId = bt.data.id;
    res.status(202).json({ ok: true, projectId, batchId });
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: e?.message || "ingest failed" });
  }
});

app.listen(PORT, () => console.log(`Function ingest-credit on :${PORT}`));


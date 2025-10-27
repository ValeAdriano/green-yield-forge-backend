import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8080);
const MS_PROJECTS = process.env.MS_PROJECTS_BASE_URL!;
const MS_ORDERS   = process.env.MS_ORDERS_BASE_URL!;
const FN_INGEST   = process.env.FN_INGEST_URL!;
const FN_RECEIPT  = process.env.FN_RECEIPT_URL!;

app.get("/healthz", (_req, res) => res.json({ status: "ok", service: "bff" }));

app.get("/aggregate/project/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [p, b, o] = await Promise.all([
      axios.get(`${MS_PROJECTS}/projects/${id}`),
      axios.get(`${MS_PROJECTS}/batches`, { params: { projectId: id } }),
      axios.get(`${MS_ORDERS}/orders`, { params: { projectId: id } })
    ]);
    res.json({ project: p.data, batches: b.data, lastOrders: o.data });
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: e?.message || "aggregate failed" });
  }
});

["projects","batches"].forEach(entity => {
  const base = `${MS_PROJECTS}/${entity}`;
  app.get(`/${entity}`, (req, res)=> axios.get(base, { params: req.query }).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
  app.post(`/${entity}`, (req, res)=> axios.post(base, req.body).then(r=>res.status(201).json(r.data)).catch(e=>res.status(500).json({error:e.message})));
  app.get(`/${entity}/:id`, (req, res)=> axios.get(`${base}/${req.params.id}`).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
  app.put(`/${entity}/:id`, (req, res)=> axios.put(`${base}/${req.params.id}`, req.body).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
  app.delete(`/${entity}/:id`, (req, res)=> axios.delete(`${base}/${req.params.id}`).then(()=>res.status(204).end()).catch(e=>res.status(500).json({error:e.message})));
});

app.get("/orders", (req, res)=> axios.get(`${MS_ORDERS}/orders`, { params: req.query }).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
app.post("/orders", (req, res)=> axios.post(`${MS_ORDERS}/orders`, req.body).then(r=>res.status(201).json(r.data)).catch(e=>res.status(500).json({error:e.message})));
app.get("/orders/:id", (req, res)=> axios.get(`${MS_ORDERS}/orders/${req.params.id}`).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
app.put("/orders/:id", (req, res)=> axios.put(`${MS_ORDERS}/orders/${req.params.id}`, req.body).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));
app.delete("/orders/:id", (req, res)=> axios.delete(`${MS_ORDERS}/orders/${req.params.id}`).then(()=>res.status(204).end()).catch(e=>res.status(500).json({error:e.message})));

app.post("/events/ingest", (req, res)=> axios.post(FN_INGEST, req.body).then(r=>res.status(202).json(r.data)).catch(e=>res.status(500).json({error:e.message})));
app.post("/events/receipt", (req, res)=> axios.post(FN_RECEIPT, req.body).then(r=>res.status(202).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

app.listen(PORT, () => console.log(`BFF on :${PORT}`));


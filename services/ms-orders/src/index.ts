import express from "express";
import cors from "cors";
import sql from "mssql";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8080);
const SQL_CONN = process.env.SQL_CONN!;

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.get("/orders", async (req, res) => {
  const pool = await sql.connect(SQL_CONN);
  const projectId = req.query.projectId as string | undefined;
  const status = req.query.status as string | undefined;
  let query = "SELECT * FROM dbo.orders";
  const where: string[] = [];
  if (projectId) where.push(`projectId='${projectId}'`);
  if (status) where.push(`status='${status}'`);
  if (where.length) query += " WHERE " + where.join(" AND ");
  const r = await pool.request().query(query);
  res.json(r.recordset);
});

app.post("/orders", async (req, res) => {
  const { projectId, batchId, buyerName, qtyTons, total, status } = req.body;
  const pool = await sql.connect(SQL_CONN);
  await pool.request().query(`
    INSERT INTO dbo.orders (projectId, batchId, buyerName, qtyTons, total, status)
    VALUES ('${projectId}', '${batchId}', '${buyerName}', ${qtyTons}, ${total}, '${status}')
  `);
  res.status(201).json({ ok: true });
});

app.get("/orders/:id", async (req, res) => {
  const pool = await sql.connect(SQL_CONN);
  const r = await pool.request().query(`SELECT * FROM dbo.orders WHERE id='${req.params.id}'`);
  if (!r.recordset.length) return res.status(404).json({ error: "not found" });
  res.json(r.recordset[0]);
});

app.put("/orders/:id", async (req, res) => {
  const sets = Object.entries(req.body).map(([k, v]) => `${k}='${v}'`).join(", ");
  const pool = await sql.connect(SQL_CONN);
  await pool.request().query(`UPDATE dbo.orders SET ${sets} WHERE id='${req.params.id}'`);
  const r = await pool.request().query(`SELECT * FROM dbo.orders WHERE id='${req.params.id}'`);
  res.json(r.recordset[0]);
});

app.delete("/orders/:id", async (req, res) => {
  const pool = await sql.connect(SQL_CONN);
  await pool.request().query(`DELETE FROM dbo.orders WHERE id='${req.params.id}'`);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`MS-Orders on :${PORT}`));


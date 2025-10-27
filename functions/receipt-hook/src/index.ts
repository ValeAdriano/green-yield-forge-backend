import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8091);
const MS_ORDERS = process.env.MS_ORDERS_BASE_URL!;

app.post("/api/receipt-hook", async (req, res) => {
  try {
    const { orderId } = req.body;
    await axios.put(`${MS_ORDERS}/orders/${orderId}`, { status: "PAID", processedAt: new Date().toISOString() });
    res.status(202).json({ ok: true });
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: e?.message || "receipt failed" });
  }
});

app.listen(PORT, () => console.log(`Function receipt-hook on :${PORT}`));


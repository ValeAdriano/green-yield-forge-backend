import express from "express";
import cors from "cors";
import axios from "axios";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8080);
const MS_PROJECTS = process.env.MS_PROJECTS_BASE_URL!;
const MS_ORDERS   = process.env.MS_ORDERS_BASE_URL!;
const FN_INGEST   = process.env.FN_INGEST_URL!;
const FN_RECEIPT  = process.env.FN_RECEIPT_URL!;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BFF API",
      version: "1.0.0",
      description: "Backend for Frontend - API agregadora que orquestra chamadas aos microserviços"
    },
    servers: [
      { url: "http://localhost:8080", description: "Development server" }
    ],
    components: {
      schemas: {
        AggregateProjectResponse: {
          type: "object",
          properties: {
            project: { type: "object" },
            batches: { type: "array", items: { type: "object" } },
            lastOrders: { type: "array", items: { type: "object" } }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    }
  },
  apis: ["./dist/index.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 service:
 *                   type: string
 */
app.get("/healthz", (_req, res) => res.json({ status: "ok", service: "bff" }));

/**
 * @swagger
 * /aggregate/project/{id}:
 *   get:
 *     summary: Aggregate project data with batches and orders
 *     tags: [Aggregate]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aggregated project data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AggregateProjectResponse'
 *       500:
 *         description: Error aggregating data
 */
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

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List all projects (proxied to MS Projects)
 *     tags: [Projects]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
app.get("/projects", (req, res)=> axios.get(`${MS_PROJECTS}/projects`, { params: req.query }).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project (proxied to MS Projects)
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Project created
 */
app.post("/projects", (req, res)=> axios.post(`${MS_PROJECTS}/projects`, req.body).then(r=>res.status(201).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID (proxied to MS Projects)
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 */
app.get("/projects/:id", (req, res)=> axios.get(`${MS_PROJECTS}/projects/${req.params.id}`).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project (proxied to MS Projects)
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Project updated
 */
app.put("/projects/:id", (req, res)=> axios.put(`${MS_PROJECTS}/projects/${req.params.id}`, req.body).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project (proxied to MS Projects)
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Project deleted
 */
app.delete("/projects/:id", (req, res)=> axios.delete(`${MS_PROJECTS}/projects/${req.params.id}`).then(()=>res.status(204).end()).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /batches:
 *   get:
 *     summary: List all batches (proxied to MS Projects)
 *     tags: [Batches]
 *     parameters:
 *       - name: projectId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of batches
 */
app.get("/batches", (req, res)=> axios.get(`${MS_PROJECTS}/batches`, { params: req.query }).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /batches:
 *   post:
 *     summary: Create a new batch (proxied to MS Projects)
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Batch created
 */
app.post("/batches", (req, res)=> axios.post(`${MS_PROJECTS}/batches`, req.body).then(r=>res.status(201).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /batches/{id}:
 *   get:
 *     summary: Get a batch by ID (proxied to MS Projects)
 *     tags: [Batches]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch details
 */
app.get("/batches/:id", (req, res)=> axios.get(`${MS_PROJECTS}/batches/${req.params.id}`).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /batches/{id}:
 *   put:
 *     summary: Update a batch (proxied to MS Projects)
 *     tags: [Batches]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Batch updated
 */
app.put("/batches/:id", (req, res)=> axios.put(`${MS_PROJECTS}/batches/${req.params.id}`, req.body).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /batches/{id}:
 *   delete:
 *     summary: Delete a batch (proxied to MS Projects)
 *     tags: [Batches]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Batch deleted
 */
app.delete("/batches/:id", (req, res)=> axios.delete(`${MS_PROJECTS}/batches/${req.params.id}`).then(()=>res.status(204).end()).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List all orders (proxied to MS Orders)
 *     tags: [Orders]
 *     parameters:
 *       - name: projectId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 */
app.get("/orders", (req, res)=> axios.get(`${MS_ORDERS}/orders`, { params: req.query }).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (proxied to MS Orders)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created
 */
app.post("/orders", (req, res)=> axios.post(`${MS_ORDERS}/orders`, req.body).then(r=>res.status(201).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID (proxied to MS Orders)
 *     tags: [Orders]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
app.get("/orders/:id", (req, res)=> axios.get(`${MS_ORDERS}/orders/${req.params.id}`).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order (proxied to MS Orders)
 *     tags: [Orders]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Order updated
 */
app.put("/orders/:id", (req, res)=> axios.put(`${MS_ORDERS}/orders/${req.params.id}`, req.body).then(r=>res.json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order (proxied to MS Orders)
 *     tags: [Orders]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted
 */
app.delete("/orders/:id", (req, res)=> axios.delete(`${MS_ORDERS}/orders/${req.params.id}`).then(()=>res.status(204).end()).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /events/ingest:
 *   post:
 *     summary: Trigger ingest credit event (proxied to Function)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       202:
 *         description: Event accepted
 */
app.post("/events/ingest", (req, res)=> axios.post(FN_INGEST, req.body).then(r=>res.status(202).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

/**
 * @swagger
 * /events/receipt:
 *   post:
 *     summary: Trigger receipt hook event (proxied to Function)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       202:
 *         description: Event accepted
 */
app.post("/events/receipt", (req, res)=> axios.post(FN_RECEIPT, req.body).then(r=>res.status(202).json(r.data)).catch(e=>res.status(500).json({error:e.message})));

app.listen(PORT, () => {
  console.log(`BFF on :${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

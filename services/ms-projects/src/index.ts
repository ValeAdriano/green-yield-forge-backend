import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DB_NAME || "pjbl";

// Schemas
const ProjectCreate = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  hectares: z.number().optional(),
  description: z.string().optional(),
  certifier: z.string().optional()
});
const ProjectUpdate = ProjectCreate.partial();

const BatchCreate = z.object({
  projectId: z.string().min(1),
  tonsCO2: z.number().positive(),
  pricePerTon: z.number().positive(),
  status: z.enum(["AVAILABLE","RESERVED","SOLD"]).default("AVAILABLE")
});
const BatchUpdate = BatchCreate.partial();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MS Projects API",
      version: "1.0.0",
      description: "API para gerenciamento de projetos e lotes de créditos de carbono"
    },
    servers: [
      { url: "http://localhost:8081", description: "Development server" }
    ],
    components: {
      schemas: {
        Project: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            location: { type: "string" },
            hectares: { type: "number" },
            description: { type: "string" },
            certifier: { type: "string" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        Batch: {
          type: "object",
          properties: {
            id: { type: "string" },
            projectId: { type: "string" },
            tonsCO2: { type: "number" },
            pricePerTon: { type: "number" },
            status: { type: "string", enum: ["AVAILABLE", "RESERVED", "SOLD"] },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: { type: "array", items: {} },
            page: { type: "number" },
            pageSize: { type: "number" },
            total: { type: "number" }
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

let projects: any, batches: any;
const idToObj = (doc: any) => (doc ? ({ id: doc._id.toString(), ...doc }) : null);

// Health
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
 *                 version:
 *                   type: string
 */
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Projects
/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List all projects with pagination
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
app.get("/projects", async (req, res) => {
  const q: any = {};
  if (req.query.search) q.name = { $regex: String(req.query.search), $options: "i" };
  const page = Math.max(parseInt(String(req.query.page || "1")), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "20")), 1), 100);
  const cursor = projects.find(q).sort({ _id: -1 }).skip((page-1)*pageSize).limit(pageSize);
  const data = (await cursor.toArray()).map(idToObj);
  const total = await projects.countDocuments(q);
  res.json({ data, page, pageSize, total });
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               hectares:
 *                 type: number
 *               description:
 *                 type: string
 *               certifier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/projects", async (req, res) => {
  const parsed = ProjectCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const doc = { ...parsed.data, createdAt: new Date().toISOString() };
  const r = await projects.insertOne(doc);
  res.status(201).json({ id: r.insertedId.toString(), ...doc });
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/projects/:id", async (req, res) => {
  try {
    const p = await projects.findOne({ _id: new ObjectId(req.params.id) });
    if (!p) return res.status(404).json({ error: "not found" });
    res.json(idToObj(p));
  } catch {
    res.status(400).json({ error: "invalid id" });
  }
});

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project
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
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               hectares:
 *                 type: number
 *               description:
 *                 type: string
 *               certifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put("/projects/:id", async (req, res) => {
  const parsed = ProjectUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    await projects.updateOne({ _id: new ObjectId(req.params.id) }, { $set: parsed.data });
    const p = await projects.findOne({ _id: new ObjectId(req.params.id) });
    if (!p) return res.status(404).json({ error: "not found" });
    res.json(idToObj(p));
  } catch {
    res.status(400).json({ error: "invalid id" });
  }
});

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
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
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete("/projects/:id", async (req, res) => {
  try {
    await projects.deleteOne({ _id: new ObjectId(req.params.id) });
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }
  res.status(204).end();
});

// Batches
/**
 * @swagger
 * /batches:
 *   get:
 *     summary: List all batches with pagination
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
 *           enum: [AVAILABLE, RESERVED, SOLD]
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of batches
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
app.get("/batches", async (req, res) => {
  const q: any = {};
  if (req.query.projectId) q.projectId = String(req.query.projectId);
  if (req.query.status) q.status = String(req.query.status);
  const page = Math.max(parseInt(String(req.query.page || "1")), 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "20")), 1), 100);
  const cursor = batches.find(q).sort({ _id: -1 }).skip((page-1)*pageSize).limit(pageSize);
  const data = (await cursor.toArray()).map(idToObj);
  const total = await batches.countDocuments(q);
  res.json({ data, page, pageSize, total });
});

/**
 * @swagger
 * /batches:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - tonsCO2
 *               - pricePerTon
 *             properties:
 *               projectId:
 *                 type: string
 *               tonsCO2:
 *                 type: number
 *               pricePerTon:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, SOLD]
 *                 default: AVAILABLE
 *     responses:
 *       201:
 *         description: Batch created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/batches", async (req, res) => {
  const parsed = BatchCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const doc = { ...parsed.data, createdAt: new Date().toISOString() };
  const r = await batches.insertOne(doc);
  res.status(201).json({ id: r.insertedId.toString(), ...doc });
});

/**
 * @swagger
 * /batches/{id}:
 *   get:
 *     summary: Get a batch by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Batch not found
 *       400:
 *         description: Invalid ID
 */
app.get("/batches/:id", async (req, res) => {
  try {
    const b = await batches.findOne({ _id: new ObjectId(req.params.id) });
    if (!b) return res.status(404).json({ error: "not found" });
    res.json(idToObj(b));
  } catch {
    res.status(400).json({ error: "invalid id" });
  }
});

/**
 * @swagger
 * /batches/{id}:
 *   put:
 *     summary: Update a batch
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
 *             properties:
 *               projectId:
 *                 type: string
 *               tonsCO2:
 *                 type: number
 *               pricePerTon:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, SOLD]
 *     responses:
 *       200:
 *         description: Batch updated
 *       404:
 *         description: Batch not found
 *       400:
 *         description: Invalid ID or validation error
 */
app.put("/batches/:id", async (req, res) => {
  const parsed = BatchUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    await batches.updateOne({ _id: new ObjectId(req.params.id) }, { $set: parsed.data });
    const b = await batches.findOne({ _id: new ObjectId(req.params.id) });
    if (!b) return res.status(404).json({ error: "not found" });
    res.json(idToObj(b));
  } catch {
    res.status(400).json({ error: "invalid id" });
  }
});

/**
 * @swagger
 * /batches/{id}:
 *   delete:
 *     summary: Delete a batch
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
 *       400:
 *         description: Invalid ID
 */
app.delete("/batches/:id", async (req, res) => {
  try {
    await batches.deleteOne({ _id: new ObjectId(req.params.id) });
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }
  res.status(204).end();
});

new MongoClient(MONGODB_URI).connect().then(client => {
  const db = client.db(DB_NAME);
  projects = db.collection("projects");
  batches  = db.collection("batches");
  projects.createIndex?.({ name: 1 }).catch(()=>{});
  batches.createIndex?.({ projectId: 1 }).catch(()=>{});
  app.listen(PORT, () => console.log(`MS-Projects on :${PORT}`));
}).catch(err => {
  console.error("Mongo connection failed:", err.message);
  process.exit(1);
});


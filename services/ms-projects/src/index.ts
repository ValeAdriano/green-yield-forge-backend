import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const PORT = Number(process.env.PORT || 8081);
const prisma = new PrismaClient();

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
app.get("/healthz", (_req, res) => res.json({ status: "ok", service: "ms-projects", version: "1.0.0" }));

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
  try {
    const where: any = {};
    if (req.query.search) {
      // Prisma MongoDB suporta contains mas não mode insensitive
      // Para case-insensitive, usamos uma regex no Prisma Raw ou filtramos depois
      where.name = { contains: String(req.query.search) };
    }
    const page = Math.max(parseInt(String(req.query.page || "1")), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "20")), 1), 100);
    
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.project.count({ where })
    ]);
    
    // Filtro case-insensitive manual se necessário
    const searchTerm = req.query.search ? String(req.query.search).toLowerCase() : null;
    const filteredData = searchTerm 
      ? data.filter(p => p.name.toLowerCase().includes(searchTerm))
      : data;
    
    res.json({ data: filteredData, page, pageSize, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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
  try {
    const parsed = ProjectCreate.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const project = await prisma.project.create({
      data: parsed.data
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
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
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });
    if (!project) return res.status(404).json({ error: "not found" });
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
  try {
    const parsed = ProjectUpdate.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: parsed.data
    });
    res.json(project);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(400).json({ error: error.message });
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
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(400).json({ error: error.message });
  }
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
  try {
    const where: any = {};
    if (req.query.projectId) where.projectId = String(req.query.projectId);
    if (req.query.status) where.status = String(req.query.status);
    
    const page = Math.max(parseInt(String(req.query.page || "1")), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "20")), 1), 100);
    
    const [data, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.batch.count({ where })
    ]);
    
    res.json({ data, page, pageSize, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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
  try {
    const parsed = BatchCreate.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const batch = await prisma.batch.create({
      data: parsed.data
    });
    res.status(201).json(batch);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
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
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id }
    });
    if (!batch) return res.status(404).json({ error: "not found" });
    res.json(batch);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
  try {
    const parsed = BatchUpdate.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const batch = await prisma.batch.update({
      where: { id: req.params.id },
      data: parsed.data
    });
    res.json(batch);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(400).json({ error: error.message });
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
    await prisma.batch.delete({
      where: { id: req.params.id }
    });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`MS-Projects on :${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { execSync } from "child_process";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8082);
const prisma = new PrismaClient();

// Função para executar migrations automaticamente
async function runMigrations() {
  // Determina o diretório base (raiz do projeto, não dist/)
  const cwd = process.cwd();
  const baseDir = cwd.includes(path.sep + 'dist') || cwd.endsWith('dist')
    ? path.resolve(cwd, '..')
    : cwd;
  
  try {
    console.log("🔄 Executando migrations do Prisma...");
    execSync("npx prisma migrate deploy", { 
      stdio: "inherit", 
      cwd: baseDir,
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" }
    });
    console.log("✅ Migrations executadas com sucesso!");
  } catch (error: any) {
    console.warn("⚠️  Aviso ao executar migrations:", error.message);
    // Tenta criar o banco se não existir (útil para desenvolvimento)
    try {
      console.log("🔄 Tentando criar/atualizar o banco de dados com db push...");
      execSync("npx prisma db push --accept-data-loss", { 
        stdio: "inherit", 
        cwd: baseDir,
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" }
      });
      console.log("✅ Banco de dados criado/atualizado!");
    } catch (pushError: any) {
      console.error("❌ Erro ao criar banco de dados:", pushError.message);
      console.log("ℹ️  Continuando sem migrations...");
    }
  }
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MS Orders API",
      version: "1.0.0",
      description: "API para gerenciamento de pedidos de créditos de carbono"
    },
    servers: [
      { url: "http://localhost:8082", description: "Development server" }
    ],
    components: {
      schemas: {
        Order: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            projectId: { type: "string" },
            batchId: { type: "string" },
            buyerName: { type: "string" },
            qtyTons: { type: "number" },
            total: { type: "number" },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            processedAt: { type: "string", format: "date-time", nullable: true }
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
app.get("/healthz", (_req, res) => res.json({ status: "ok", service: "ms-orders" }));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List all orders with optional filters
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
app.get("/orders", async (req, res) => {
  try {
    const where: any = {};
    if (req.query.projectId) where.projectId = String(req.query.projectId);
    if (req.query.status) where.status = String(req.query.status);
    
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (error: any) {
    if (error.code === "P1001") {
      return res.status(503).json({ 
        error: "Database connection failed", 
        message: "Não foi possível conectar ao banco de dados. Verifique a connection string e o firewall.",
        code: "P1001"
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - batchId
 *               - buyerName
 *               - qtyTons
 *               - total
 *               - status
 *             properties:
 *               projectId:
 *                 type: string
 *               batchId:
 *                 type: string
 *               buyerName:
 *                 type: string
 *               qtyTons:
 *                 type: number
 *               total:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 */
app.post("/orders", async (req, res) => {
  try {
    const { projectId, batchId, buyerName, qtyTons, total, status } = req.body;
    const order = await prisma.order.create({
      data: {
        projectId,
        batchId,
        buyerName,
        qtyTons: Number(qtyTons),
        total: Number(total),
        status: status || "PENDING"
      }
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id }
    });
    if (!order) return res.status(404).json({ error: "not found" });
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
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
 *             properties:
 *               projectId:
 *                 type: string
 *               batchId:
 *                 type: string
 *               buyerName:
 *                 type: string
 *               qtyTons:
 *                 type: number
 *               total:
 *                 type: number
 *               status:
 *                 type: string
 *               processedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
app.put("/orders/:id", async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(order);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
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
 *       404:
 *         description: Order not found
 */
app.delete("/orders/:id", async (req, res) => {
  try {
    await prisma.order.delete({
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

// Inicializar servidor com migrations
async function startServer() {
  let dbConnected = false;
  
  try {
    // Verificar se Prisma Client está disponível
    console.log("🔍 Verificando Prisma Client...");
    await prisma.$connect();
    console.log("✅ Prisma Client conectado!");
    
    // Executar migrations antes de iniciar o servidor
    await runMigrations();
    
    // Testar conexão com o banco
    console.log("🔍 Testando conexão com o banco de dados...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Conexão com banco de dados OK!");
    dbConnected = true;
  } catch (error: any) {
    console.warn("\n⚠️  Aviso: Não foi possível conectar ao banco de dados.");
    console.warn("Mensagem:", error.message);
    
    if (error.code === "P1001") {
      console.warn("\n💡 Dica: Não foi possível conectar ao banco de dados.");
      console.warn("   Verifique:");
      console.warn("   1. Se o arquivo .env existe e tem SQLSERVER_URL configurado");
      console.warn("   2. Se o firewall do Azure SQL permite seu IP");
      console.warn("   3. Se a connection string está correta");
      console.warn("\n   O servidor vai iniciar mesmo assim, mas as rotas de banco não funcionarão.");
    } else if (error.code === "P2002") {
      console.warn("\n💡 Dica: Erro de constraint no banco de dados.");
    } else if (error.message?.includes("PrismaClient")) {
      console.warn("\n💡 Dica: Prisma Client não foi gerado.");
      console.warn("   Execute: npm run prisma:generate");
    }
    
    console.warn("\n📚 Veja mais informações em:");
    console.warn("   - services/ms-orders/README.md");
    console.warn("   - services/ms-orders/AZURE_SQL_SETUP.md");
    console.warn("\n   ⚠️  Servidor iniciando sem conexão com banco...\n");
  }
  
  // Inicia o servidor mesmo sem conexão com banco
  app.listen(PORT, () => {
    console.log(`MS-Orders on :${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    if (!dbConnected) {
      console.log(`⚠️  Warning: Database connection failed - some endpoints may not work`);
    }
  });
}

startServer().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

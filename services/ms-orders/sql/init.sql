CREATE TABLE dbo.orders (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  projectId NVARCHAR(100) NOT NULL,
  batchId   NVARCHAR(100) NOT NULL,
  buyerName NVARCHAR(200) NOT NULL,
  qtyTons   FLOAT NOT NULL,
  total     FLOAT NOT NULL,
  status    NVARCHAR(50) NOT NULL,
  createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  processedAt DATETIME2 NULL
);
CREATE INDEX IX_orders_projectId ON dbo.orders(projectId);
CREATE INDEX IX_orders_status    ON dbo.orders(status);
CREATE INDEX IX_orders_createdAt ON dbo.orders(createdAt);


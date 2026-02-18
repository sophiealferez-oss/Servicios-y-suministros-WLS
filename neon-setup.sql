-- ==========================================
-- SCRIPT SQL PARA NEON
-- Ejecuta esto en Neon SQL Editor
-- ==========================================

-- Verificar tablas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Crear tabla Users si no existe
CREATE TABLE IF NOT EXISTS "Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla contacts si no existe
CREATE TABLE IF NOT EXISTS "contacts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  machine VARCHAR(255),
  message TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla quotations si no existe
CREATE TABLE IF NOT EXISTS "quotations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "Users"(id),
  equipment VARCHAR(255) NOT NULL,
  days INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  "contactInfo" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar que las tablas se crearon
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

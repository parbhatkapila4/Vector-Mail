-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Update Email table to use vector type for embeddings
-- First drop the existing column if it exists
ALTER TABLE "Email" DROP COLUMN IF EXISTS "embedding";

-- Add the embedding column as vector(768)
ALTER TABLE "Email" ADD COLUMN "embedding" vector(768);



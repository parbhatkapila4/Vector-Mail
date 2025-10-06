-- Convert embedding column from text to vector(768)
ALTER TABLE "Email" 
ALTER COLUMN embedding TYPE vector(768) USING embedding::vector;


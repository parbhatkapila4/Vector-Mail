ALTER TABLE "Email" 
ALTER COLUMN embedding TYPE vector(768) USING embedding::vector;


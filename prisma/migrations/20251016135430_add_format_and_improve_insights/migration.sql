-- CreateEnum
CREATE TYPE "public"."PostFormat" AS ENUM ('BINARY');

-- AlterTable
ALTER TABLE "public"."AiInsight" ADD COLUMN     "argsAtGeneration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "generationTrigger" TEXT,
ADD COLUMN     "votesAtGeneration" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "format" "public"."PostFormat" NOT NULL DEFAULT 'BINARY';

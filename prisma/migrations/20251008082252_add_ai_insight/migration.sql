-- CreateTable
CREATE TABLE "public"."AiInsight" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiInsight_questionId_key" ON "public"."AiInsight"("questionId");

-- AddForeignKey
ALTER TABLE "public"."AiInsight" ADD CONSTRAINT "AiInsight_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

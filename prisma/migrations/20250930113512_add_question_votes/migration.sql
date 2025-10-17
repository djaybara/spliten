-- CreateTable
CREATE TABLE "public"."QuestionVote" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "public"."Side" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionVote_questionId_idx" ON "public"."QuestionVote"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVote_questionId_userId_key" ON "public"."QuestionVote"("questionId", "userId");

-- AddForeignKey
ALTER TABLE "public"."QuestionVote" ADD CONSTRAINT "QuestionVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionVote" ADD CONSTRAINT "QuestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

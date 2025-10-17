/*
  Warnings:

  - A unique constraint covering the columns `[dedupeHash]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'MOD', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'LOCKED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "public"."Side" AS ENUM ('pour', 'contre');

-- CreateEnum
CREATE TYPE "public"."VoteType" AS ENUM ('up', 'down');

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "argumentsACount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "argumentsBCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "argumentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "controversyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dedupeHash" TEXT,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "discussionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "downvotesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."QuestionStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "trendScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "upvotesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votesACount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votesBCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wilsonScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."Argument" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "side" "public"."Side" NOT NULL,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isMasked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Argument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArgumentVote" (
    "id" TEXT NOT NULL,
    "argumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArgumentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Discussion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "isMasked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SourceLink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "questionId" TEXT,
    "argumentId" TEXT,
    "discussionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionTag" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Argument_questionId_side_idx" ON "public"."Argument"("questionId", "side");

-- CreateIndex
CREATE INDEX "Argument_parentId_idx" ON "public"."Argument"("parentId");

-- CreateIndex
CREATE INDEX "Argument_createdAt_idx" ON "public"."Argument"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArgumentVote_argumentId_userId_key" ON "public"."ArgumentVote"("argumentId", "userId");

-- CreateIndex
CREATE INDEX "Discussion_questionId_idx" ON "public"."Discussion"("questionId");

-- CreateIndex
CREATE INDEX "Discussion_createdAt_idx" ON "public"."Discussion"("createdAt");

-- CreateIndex
CREATE INDEX "SourceLink_questionId_idx" ON "public"."SourceLink"("questionId");

-- CreateIndex
CREATE INDEX "SourceLink_argumentId_idx" ON "public"."SourceLink"("argumentId");

-- CreateIndex
CREATE INDEX "SourceLink_discussionId_idx" ON "public"."SourceLink"("discussionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_questionId_tagId_key" ON "public"."QuestionTag"("questionId", "tagId");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "public"."Report"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_dedupeHash_key" ON "public"."Question"("dedupeHash");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "public"."Question"("category");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "public"."Question"("createdAt");

-- CreateIndex
CREATE INDEX "Question_lastActivityAt_idx" ON "public"."Question"("lastActivityAt");

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Argument" ADD CONSTRAINT "Argument_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Argument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArgumentVote" ADD CONSTRAINT "ArgumentVote_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "public"."Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArgumentVote" ADD CONSTRAINT "ArgumentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discussion" ADD CONSTRAINT "Discussion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discussion" ADD CONSTRAINT "Discussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SourceLink" ADD CONSTRAINT "SourceLink_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SourceLink" ADD CONSTRAINT "SourceLink_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "public"."Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SourceLink" ADD CONSTRAINT "SourceLink_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "public"."Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionTag" ADD CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionTag" ADD CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

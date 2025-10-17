-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "aiInsights" JSONB DEFAULT '{}',
ADD COLUMN     "aiInsightsUpdatedAt" TIMESTAMP(3);

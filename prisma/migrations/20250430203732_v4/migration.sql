-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "goal_id" INTEGER;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

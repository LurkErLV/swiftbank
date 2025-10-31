/*
  Warnings:

  - Added the required column `beneficiaryAccountNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "beneficiaryAccountNumber" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `email_paciente` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `lembrete_enviado` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `medico_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `nome_paciente` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `dia_semana` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `hora_fim` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `hora_inicio` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `medico_id` on the `schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailPaciente` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomePaciente` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diaSemana` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaFim` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaInicio` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoId` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_medico_id_fkey";

-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_medico_id_fkey";

-- DropIndex
DROP INDEX "doctors_user_id_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "email_paciente",
DROP COLUMN "lembrete_enviado",
DROP COLUMN "medico_id",
DROP COLUMN "nome_paciente",
ADD COLUMN     "emailPaciente" TEXT NOT NULL,
ADD COLUMN     "lembreteEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicoId" TEXT NOT NULL,
ADD COLUMN     "nomePaciente" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "dia_semana",
DROP COLUMN "hora_fim",
DROP COLUMN "hora_inicio",
DROP COLUMN "medico_id",
ADD COLUMN     "diaSemana" INTEGER NOT NULL,
ADD COLUMN     "horaFim" TEXT NOT NULL,
ADD COLUMN     "horaInicio" TEXT NOT NULL,
ADD COLUMN     "medicoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "rendez_vous" ADD COLUMN     "time" TEXT;

-- CreateTable
CREATE TABLE "actes_notaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numeroActe" TEXT NOT NULL,
    "typeActe" TEXT NOT NULL,
    "dateActe" TIMESTAMP(3) NOT NULL,
    "dateEnregistrement" TIMESTAMP(3),
    "clientPrincipal" TEXT,
    "clientId" TEXT,
    "description" TEXT,
    "montantTransaction" DOUBLE PRECISION,
    "references" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EN_COURS',
    "dateSignature" TIMESTAMP(3),
    "signatureDigitale" TEXT,
    "nombrePages" INTEGER,
    "documentUrl" TEXT,
    "certificats" TEXT,
    "numeroRegistre" TEXT,
    "lieuRegistre" TEXT,
    "controleLegalite" BOOLEAN NOT NULL DEFAULT false,
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actes_notaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registre_notariae" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acteId" TEXT NOT NULL,
    "numeroRegistre" TEXT NOT NULL,
    "sousNumero" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER,
    "page" INTEGER,
    "dateEnregistrement" TIMESTAMP(3) NOT NULL,
    "dateExpedition" TIMESTAMP(3),
    "statusLegal" TEXT NOT NULL DEFAULT 'ENREGISTRE',
    "fraisRegistre" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registre_notariae_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "acteId" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "qualite" TEXT NOT NULL,
    "nationalite" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "numIdNationale" TEXT,
    "adresseComplete" TEXT,
    "wilaya" TEXT,
    "commune" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "dateSig" TIMESTAMP(3),
    "signatureDigi" TEXT,
    "temoins" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aides_notaire" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "typeActe" TEXT,
    "categorie" TEXT NOT NULL,
    "dateValidation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aides_notaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_actes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeActe" TEXT NOT NULL,
    "description" TEXT,
    "contenuTemplate" TEXT NOT NULL,
    "champs" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_actes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actes_notaries_numeroActe_key" ON "actes_notaries"("numeroActe");

-- CreateIndex
CREATE INDEX "actes_notaries_userId_idx" ON "actes_notaries"("userId");

-- CreateIndex
CREATE INDEX "actes_notaries_numeroActe_idx" ON "actes_notaries"("numeroActe");

-- CreateIndex
CREATE INDEX "actes_notaries_status_idx" ON "actes_notaries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "registre_notariae_acteId_key" ON "registre_notariae"("acteId");

-- CreateIndex
CREATE UNIQUE INDEX "registre_notariae_numeroRegistre_key" ON "registre_notariae"("numeroRegistre");

-- CreateIndex
CREATE INDEX "registre_notariae_numeroRegistre_idx" ON "registre_notariae"("numeroRegistre");

-- CreateIndex
CREATE INDEX "registre_notariae_userId_idx" ON "registre_notariae"("userId");

-- CreateIndex
CREATE INDEX "parties_acteId_idx" ON "parties"("acteId");

-- CreateIndex
CREATE INDEX "aides_notaire_userId_idx" ON "aides_notaire"("userId");

-- CreateIndex
CREATE INDEX "aides_notaire_categorie_idx" ON "aides_notaire"("categorie");

-- CreateIndex
CREATE INDEX "template_actes_userId_idx" ON "template_actes"("userId");

-- AddForeignKey
ALTER TABLE "actes_notaries" ADD CONSTRAINT "actes_notaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actes_notaries" ADD CONSTRAINT "actes_notaries_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registre_notariae" ADD CONSTRAINT "registre_notariae_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registre_notariae" ADD CONSTRAINT "registre_notariae_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "actes_notaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "actes_notaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aides_notaire" ADD CONSTRAINT "aides_notaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_actes" ADD CONSTRAINT "template_actes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

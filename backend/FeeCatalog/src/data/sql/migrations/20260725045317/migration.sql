-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "addon_versions" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addon_id" BIGINT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "VersionStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "apply_mode" TEXT NOT NULL,
    "approval_needed" BOOLEAN NOT NULL,
    "approver_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT NOT NULL,

    CONSTRAINT "addon_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addons" (
    "id" BIGSERIAL NOT NULL,
    "is_recurring" BOOLEAN NOT NULL,

    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "duration_years" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structure_versions" (
    "id" BIGSERIAL NOT NULL,
    "fee_structure_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "VersionStatus" NOT NULL,
    "late_fee_per_day" INTEGER NOT NULL,
    "payment_window_offset_days" INTEGER NOT NULL,
    "due_date_offset_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT NOT NULL,

    CONSTRAINT "fee_structure_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" BIGSERIAL NOT NULL,
    "course" BIGINT NOT NULL,
    "category" BIGINT NOT NULL,
    "batch" BIGINT NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_time_costs" (
    "id" BIGSERIAL NOT NULL,
    "fee_structure_version_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "refundable" BOOLEAN NOT NULL,

    CONSTRAINT "one_time_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term_components" (
    "id" BIGSERIAL NOT NULL,
    "term_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "term_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" BIGSERIAL NOT NULL,
    "fee_structure_version_id" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "payment_window_open_date" DATE NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addon_versions_addon_id_version_key" ON "addon_versions"("addon_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_course_category_batch_key" ON "fee_structures"("course", "category", "batch");

-- AddForeignKey
ALTER TABLE "addon_versions" ADD CONSTRAINT "addon_versions_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structure_versions" ADD CONSTRAINT "fee_structure_versions_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_course_fkey" FOREIGN KEY ("course") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_batch_fkey" FOREIGN KEY ("batch") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_time_costs" ADD CONSTRAINT "one_time_costs_fee_structure_version_id_fkey" FOREIGN KEY ("fee_structure_version_id") REFERENCES "fee_structure_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_components" ADD CONSTRAINT "term_components_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_fee_structure_version_id_fkey" FOREIGN KEY ("fee_structure_version_id") REFERENCES "fee_structure_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

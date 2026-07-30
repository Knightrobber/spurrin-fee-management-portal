/**
 * Plain domain shape for creating a category. The service builds this; the
 * repository is the only place that translates it into the Prisma create input.
 */
export interface CreateCategoryData {
  name: string;
}

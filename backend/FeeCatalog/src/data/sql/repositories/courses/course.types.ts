/**
 * Plain domain shape for creating a course. The service builds this; the
 * repository is the only place that translates it into the Prisma create input.
 */
export interface CreateCourseData {
  name: string;
  durationYears: number;
}

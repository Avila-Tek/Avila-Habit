export interface INormalizeDateForWeekly {
  normalizeDateForWeekly(date: Date): { start: Date; end: Date };
}

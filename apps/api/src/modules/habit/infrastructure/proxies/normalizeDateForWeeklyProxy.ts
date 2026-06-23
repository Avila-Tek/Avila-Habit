import { FastifyInstance } from 'fastify';
import { INormalizeDateForWeekly } from '../../application/ports/normalizeDateForWeekly.port';

export class NormalizeDateForWeeklyProxy implements INormalizeDateForWeekly {
  private fastify: FastifyInstance;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  normalizeDateForWeekly(date: Date): { end: Date; start: Date } {
    return this.getAdapters().getWeekRange(date);
  }

  private getAdapters() {
    return this.fastify.habitLog.adapters;
  }
}

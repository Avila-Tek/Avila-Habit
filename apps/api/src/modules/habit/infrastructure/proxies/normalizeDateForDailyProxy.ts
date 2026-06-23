import { FastifyInstance } from 'fastify';
import { INormalizeDateForDaily } from '../../application/ports/normalizeDateForDaily.port';

export class NormalizeDateForDailyProxy implements INormalizeDateForDaily {
  private fastify: FastifyInstance;
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  normalizeDateForDaily(date: Date): Date {
    return this.getAdapters().normalizeToMidnight(date);
  }

  private getAdapters() {
    return this.fastify.habitLog.adapters;
  }
}

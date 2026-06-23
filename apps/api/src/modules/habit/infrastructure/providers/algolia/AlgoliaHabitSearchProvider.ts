import type {
  AlgoliaIndexName,
  TAlgoliaHabitRecord,
  TSearchApiKeyResponse,
} from '@repo/schemas';
import { algoliasearch, type SearchClient } from 'algoliasearch';
import type { IHabitSearchProvider } from '../../../application/ports/habitSearchProvider.port';
import type { Habit } from '../../../domain/entities/habit.entity';
import { SearchIndexError } from '../../../domain/errors/search.errors';
import type { AlgoliaConfig } from './AlgoliaConfig';

export class AlgoliaHabitSearchProvider implements IHabitSearchProvider {
  private readonly client: SearchClient;
  private readonly indexName: AlgoliaIndexName;
  private readonly appId: string;
  private readonly apiKey: string;

  constructor(config: AlgoliaConfig) {
    this.client = algoliasearch(config.appId, config.apiKey);
    this.indexName = config.indexName;
    this.appId = config.appId;
    this.apiKey = config.apiKey;
  }

  async indexHabit(habit: Habit): Promise<void> {
    try {
      const record = this.habitToAlgoliaRecord(habit);
      await this.client.saveObject({
        indexName: this.indexName,
        body: record,
      });
    } catch (error) {
      throw new SearchIndexError(
        `Failed to index habit: ${(error as Error).message}`
      );
    }
  }

  async updateHabitIndex(habit: Habit): Promise<void> {
    try {
      const record = this.habitToAlgoliaRecord(habit);
      await this.client.partialUpdateObject({
        indexName: this.indexName,
        objectID: record.objectID,
        attributesToUpdate: record,
        createIfNotExists: true,
      });
    } catch (error) {
      throw new SearchIndexError(
        `Failed to update habit index: ${(error as Error).message}`
      );
    }
  }

  async removeFromIndex(habitId: string): Promise<void> {
    try {
      await this.client.deleteObject({
        indexName: this.indexName,
        objectID: habitId,
      });
    } catch (error) {
      throw new SearchIndexError(
        `Failed to remove habit from index: ${(error as Error).message}`
      );
    }
  }

  generateSecuredApiKey(userId: string): TSearchApiKeyResponse {
    const apiKey = this.client.generateSecuredApiKey({
      parentApiKey: this.apiKey,
      restrictions: {
        filters: `userId:${userId}`,
      },
    });

    return {
      apiKey,
      appId: this.appId,
      indexName: this.indexName,
    };
  }

  private habitToAlgoliaRecord(habit: Habit): TAlgoliaHabitRecord {
    return {
      objectID: habit.id.value,
      userId: habit.userId,
      name: habit.name,
      description: habit.description,
      status: habit.status.value,
      isActive: habit.isActive,
      scheduleType: habit.schedule.type,
      scheduleDaysOfWeek: habit.schedule.daysOfWeek,
      scheduleWeeklyDay: habit.schedule.weeklyDay,
      goalUnit: habit.goal.unit,
      goalPeriod: habit.goal.period,
      goalTarget: habit.goal.target,
      timeOfDay: habit.timeOfDay.value,
      reminderEnabled: habit.reminder.enabled,
      reminderTime: habit.reminder.time,
      startDate: habit.startDate?.getTime(),
      endDate: habit.endDate?.getTime(),
      createdAt: habit.createdAt.getTime(),
      updatedAt: habit.updatedAt.getTime(),
    };
  }
}

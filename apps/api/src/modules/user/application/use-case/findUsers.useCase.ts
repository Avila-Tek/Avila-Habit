import type {
  FindUsersQuery,
  FindUsersResult,
  IFindUsersUseCase,
} from '../ports/findUsers.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class FindUsersUseCase implements IFindUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: FindUsersQuery): Promise<FindUsersResult> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findMany({ skip, take: limit }),
      this.userRepository.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

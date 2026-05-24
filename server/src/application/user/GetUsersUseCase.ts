import type { IUserRepository, UserFilter, UserSort, Pagination, PagedResult } from '../../domain/user/UserRepository'

export class GetUsersUseCase {
  constructor(private repo: IUserRepository) {}

  execute(filter: UserFilter, sort: UserSort, pagination: Pagination): PagedResult {
    return this.repo.findMany(filter, sort, pagination)
  }
}

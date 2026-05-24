import type { IUserRepository, UserFilter, UserFacets } from '../../domain/user/UserRepository'

export class GetFacetsUseCase {
  constructor(private repo: IUserRepository) {}

  execute(filter: UserFilter): UserFacets {
    return this.repo.getFacets(filter)
  }
}

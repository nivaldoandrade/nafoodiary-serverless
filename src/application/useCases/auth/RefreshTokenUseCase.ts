import { InvalidRefreshToken } from '@application/errors/application/InvalidRefreshToken';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class RefreshTokenUseCase {

  constructor(
    private readonly authGateway: AuthGateway,
  ) { }

  async execute(refreshToken: string): Promise<RefreshTokenUseCase.Output> {
    try {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = await this.authGateway.refreshToken(refreshToken);

      return {
        newAccessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      };
    } catch {
      throw new InvalidRefreshToken();
    }

  }
}

namespace RefreshTokenUseCase {
  export type Input = {
    refreshToken: string;
  }

  export type Output = {
    newAccessToken: string;
    newRefreshToken: string;
  }
}

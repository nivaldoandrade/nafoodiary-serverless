import { Controller } from '@application/contracts/Controller';
import { OAuthCallbackBody, oauthCallbackSchema } from '@application/controllers/auth/schemas/oauthCallbackSchema';
import { OAuthCallbackUseCase } from '@application/useCases/auth/OAuthCallbackUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { RateLimit } from '@kernel/decorators/RateLimit';
import { Schema } from '@kernel/decorators/Schema';

@Injectable()
@Schema(oauthCallbackSchema)
@RateLimit({ scope: 'ip', limit: 30, windowSeconds: 900 })
export class OAuthCallbackController extends Controller<'public'> {

  constructor(
    private readonly oauthCallbackUseCase: OAuthCallbackUseCase,
  ) {
    super();
  }

  protected async handler(request: Controller.RequestPublic<OAuthCallbackBody>): Promise<Controller.Response<OAuthCallbackUseCase.Output>> {

    const { code, redirectUri, codeVerifier } = request.body;

    const { accessToken, refreshToken, isOnboarded } = await this.oauthCallbackUseCase.execute({
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    return {
      statusCode: 200,
      body: {
        accessToken,
        refreshToken,
        isOnboarded,
      },
    };
  }

}

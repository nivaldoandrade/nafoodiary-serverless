import { PreTokenGenerationV3TriggerEvent } from 'aws-lambda';

export async function handler(event: PreTokenGenerationV3TriggerEvent) {

  const internalId = event.request.userAttributes['custom:internalSocialId'] ?? event.request.userAttributes['custom:internalId'];

  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          internalId,
        },
      },
    },
  };

  return event;
}

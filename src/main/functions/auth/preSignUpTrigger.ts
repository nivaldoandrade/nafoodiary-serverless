import { AdminCreateUserCommand, AdminLinkProviderForUserCommand, paginateListUsers, UserType } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@infra/clients/cognitoClient';
import { generateUniqueId } from '@shared/utils/generateUniqueId';
import { PreSignUpTriggerEvent } from 'aws-lambda';

export async function handler(event: PreSignUpTriggerEvent) {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  if (event.triggerSource !== 'PreSignUp_ExternalProvider') {
    return event;
  }

  const { userName, userPoolId } = event;
  const { email, name } = event.request.userAttributes;

  let nativeUser = await getNativeUserByEmail({ email, userPoolId });

  if (!nativeUser) {
    nativeUser = await createNative({
      name,
      email,
      userPoolId,
    });
  }

  const nativeUserId = nativeUser.Attributes?.find(({ Name }) => Name === 'sub')?.Value;

  if (!nativeUserId) {
    throw new Error(`User "${userName}" not found".`);
  }
  const [providerName, providerUserId] = userName.split('_');

  await linkProvider({
    userPoolId,
    nativeUserId,
    providerName,
    providerUserId,
  });

  return event;
}

interface IGetNativeUserByEmailParams {
  email: string;
  userPoolId: string;
}

async function getNativeUserByEmail({ email, userPoolId }: IGetNativeUserByEmailParams) {
  let nativeUser: UserType | undefined;
  const paginator = paginateListUsers(
    {
      client: cognitoClient,
      pageSize: 1,
    },
    {
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
    },
  );

  for await (const page of paginator) {
    if (page.Users && page.Users.length > 0) {
      nativeUser = page.Users[0];
      break;
    }
  }

  return nativeUser;
}

interface ICreateNativeParams {
  email: string;
  name: string;
  userPoolId: string;
}

async function createNative({ email, name, userPoolId }: ICreateNativeParams) {
  const internalId = generateUniqueId();

  const command = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: email,
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      { Name: 'email_verified', Value: 'true' },
      { Name: 'name', Value: name },
      { Name: 'custom:internalId', Value: internalId },
    ],
  });

  const { User } = await cognitoClient.send(command);

  if (!User) {
    throw new Error(`Failed to create native user for email "${email}".`);
  }

  return User;
}

interface ILinkProviderParams {
  userPoolId: string;
  nativeUserId: string;
  providerName: string;
  providerUserId: string;
}
async function linkProvider({ userPoolId, nativeUserId, providerName, providerUserId }: ILinkProviderParams) {

  const command = new AdminLinkProviderForUserCommand({
    UserPoolId: userPoolId,
    DestinationUser: {
      ProviderName: 'Cognito',
      ProviderAttributeValue: nativeUserId,
    },
    SourceUser: {
      ProviderAttributeName: 'Cognito_Subject',
      ProviderName: providerName,
      ProviderAttributeValue: providerUserId,
    },
  });

  await cognitoClient.send(command);
}

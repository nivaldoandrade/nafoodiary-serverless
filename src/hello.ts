import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(_event: APIGatewayProxyEventV2) {

  return {
    status: 200,
    body: {
      message: 'Server running...',
    },
  };
}

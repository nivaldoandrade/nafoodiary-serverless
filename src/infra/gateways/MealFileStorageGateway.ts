import { URL } from 'node:url';

import { Meal } from '@application/entities/Meal';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client } from '@infra/clients/s3Client';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { randomUUID } from 'node:crypto';

const EXPIRES_PRESIGNED_POST = 5 * 60; //5MIN

@Injectable()
export class MealFileStorageGateway {

  constructor(private readonly config: AppConfig) { }

  static generateInputFileKey({
    accountId,
    inputType,
  }: MealFileStorageGateway.GenerateInputFileKeyParams): string {
    const extension = inputType === Meal.InputType.AUDIO ? 'm4a' : 'jpeg';
    const filename = randomUUID();

    return `${accountId}/${filename}.${extension}`;
  }

  getFileURL(fileKey: string): string {
    const url = new URL(
      fileKey,
      `https://${this.config.cdn.mealsCDN}`,
    );

    return url.toString();
  }

  async getMetadata(fileKey: string): Promise<MealFileStorageGateway.GetMetadada['result']> {
    const command = new HeadObjectCommand({
      Bucket: this.config.storage.mealsBucketName,
      Key: fileKey,
    });

    const { Metadata = {} } = await s3Client.send(command);

    const metadada = Metadata as MealFileStorageGateway.GetMetadada['HeadObjectCommandResult'];

    if (!metadada.mealid || !metadada.accountid) {
      throw new Error(`Cannot get metadata file: ${fileKey}.`);
    }

    return {
      mealId: metadada.mealid,
      accountId: metadada.accountid,
    };

  }

  async getPOST({
    accountId,
    mealId,
    inputFileKey,
    inputType,
    fileSize,
  }: MealFileStorageGateway.GetPOST['params']): Promise<MealFileStorageGateway.GetPOST['result']> {
    const contentType = inputType === Meal.InputType.AUDIO
      ? 'audio/m4a'
      : 'image/jpeg';

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: this.config.storage.mealsBucketName,
      Key: inputFileKey,
      Expires: EXPIRES_PRESIGNED_POST,
      Conditions: [
        {
          'Content-Type': contentType,
        },
        ['starts-with', '$x-amz-meta-mealid', ''],
        ['starts-with', '$x-amz-meta-accountid', ''],
        ['content-length-range', fileSize, fileSize],
      ],
      Fields: {
        'Content-Type': contentType,
        'x-amz-meta-mealid': mealId,
        'x-amz-meta-accountid': accountId,
      },
    });

    const uploadSignature = Buffer.from(
      JSON.stringify({ url, fields }),
    ).toString('base64');

    return {
      uploadSignature,
    };
  }
}

export namespace MealFileStorageGateway {

  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: Meal.InputType;
  }

  export type GetPOST = {
    params: {
      mealId: string;
      accountId: string;
      inputFileKey: string;
      inputType: Meal.InputType;
      fileSize: number;
    },
    result: {
      uploadSignature: string
    }
  }

  export type GetMetadada = {
    HeadObjectCommandResult: {
      mealid: string;
      accountid: string;
    }

    result: {
      mealId: string;
      accountId: string;
    }

  }
}

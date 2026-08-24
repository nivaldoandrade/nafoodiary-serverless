import { Meal } from '@application/entities/Meal';
import { MealRepository } from '@infra/databases/dynamodb/MealRepository';
import { MealFileStorageGateway } from '@infra/gateways/MealFileStorageGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { generateUniqueId } from '@shared/utils/generateUniqueId';

@Injectable()
export class CreateMealUseCase {

  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealStorageGateway: MealFileStorageGateway,
  ) { }

  async execute({ accountId, file }: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
    const mealId = generateUniqueId();

    const inputFileKey = MealFileStorageGateway.generateInputFileKey({
      accountId,
      mimeType: file.mimeType,
    });

    const meal = new Meal({
      id: mealId,
      accountId,
      inputType: file.inputType,
      inputFileKey: inputFileKey,
      status: Meal.StatusType.UPLOADING,
    });

    const { uploadSignature } = await this.mealStorageGateway.getPOST({
      accountId,
      mealId,
      inputFileKey,
      mimeType: file.mimeType,
      fileSize: file.size,
    });

    await this.mealRepository.create(meal);

    return {
      mealId,
      uploadSignature,
    };
  }
}

export namespace CreateMealUseCase {
  export type Input = {
    accountId: string;
    file: {
      inputType: Meal.InputType;
      mimeType: Meal.MimeType;
      size: number;
    }
  }

  export type Output = {
    mealId: string;
    uploadSignature: string;
  }
}

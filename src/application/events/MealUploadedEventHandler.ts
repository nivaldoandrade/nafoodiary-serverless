import { IEventHandler } from '@application/contracts/IEventHandler';
import { MealUploadedUseCase } from '@application/useCases/meal/MealUploadedUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class MealUploadedEventHandler implements IEventHandler {

  constructor(private readonly mealUploadedUseCase: MealUploadedUseCase) { }

  async handle({ fileKey }: IEventHandler.Input): Promise<void> {
    await this.mealUploadedUseCase.execute({ fileKey });
  }
}

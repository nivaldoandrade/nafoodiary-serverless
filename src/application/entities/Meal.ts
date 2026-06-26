import { ValueOf } from '@shared/utils/ValueOf';

export class Meal {
  public static readonly MAX_ATTEMPS: number = 2;

  readonly id: string;

  readonly accountId: string;

  status: Meal.StatusType;

  readonly inputFileKey: string;

  readonly inputType: Meal.InputType;

  name: string;

  attempts: number;

  icon: string;

  foods: Meal.FoodType[];

  readonly createdAt: Date;

  constructor(attr: Meal.Attributes) {
    this.id = attr.id;
    this.accountId = attr.accountId;
    this.status = attr.status;
    this.inputFileKey = attr.inputFileKey;
    this.inputType = attr.inputType;
    this.attempts = attr.attempts ?? 0;
    this.name = attr.name ?? '';
    this.icon = attr.icon ?? '';
    this.foods = attr.foods ?? [];
    this.createdAt = attr.createdAt ?? new Date();
  }

}

export namespace Meal {
  export type Attributes = {
    id: string;
    accountId: string;
    status: Meal.StatusType;
    inputFileKey: string;
    inputType: Meal.InputType;
    attempts?: number;
    name?: string;
    icon?: string;
    foods?: Meal.FoodType[];
    createdAt?: Date;
  }

  export const StatusType = {
    UPLOADING: 'UPLOADING',
    QUEUED: 'QUEUED',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
  };

  export type StatusType = ValueOf<typeof StatusType>;

  export const InputType = {
    PICTURE: 'PICTURE',
    AUDIO: 'AUDIO',
  };

  export type InputType = ValueOf<typeof InputType>;

  export type FoodType = {
    name: string;
    quantity: string;
    calories: string;
    proteins: string;
    carbohydrates: string;
    fats: string;
  };

}

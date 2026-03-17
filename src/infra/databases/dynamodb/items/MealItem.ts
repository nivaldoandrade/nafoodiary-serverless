import { Meal } from '@application/entities/Meal';

export class MealItem {
  static readonly TYPE: MealItem.Type = 'MEAL';

  private readonly keys: MealItem.Keys;

  constructor(private readonly attrs: MealItem.Attributes) {
    this.keys = {
      PK: MealItem.getPK(attrs.id),
      SK: MealItem.getSK(attrs.id),
      GSI1PK: MealItem.GSI1PK({
        accountId: attrs.accountId,
        createdAt: new Date(attrs.createdAt),
      }),
      GSI1SK: MealItem.GSI1SK(attrs.id),
    };
  }

  static fromEntity(meal: Meal): MealItem {
    return new MealItem({
      ...meal,
      createdAt: meal.createdAt.toISOString(),
    });
  }

  static toEntity(mealIdAttr: MealItem.Attributes): Meal {
    return new Meal({
      ...mealIdAttr,
      createdAt: new Date(mealIdAttr.createdAt),
    });
  }

  getItem(): MealItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: MealItem.TYPE,
    };
  }

  static getPK(mealId: string): MealItem.Keys['PK'] {
    return `MEAL#${mealId}`;
  }

  static getSK(mealId: string): MealItem.Keys['SK'] {
    return `MEAL#${mealId}`;
  }

  static GSI1PK({ accountId, createdAt }: MealItem.GSI1PKParams): MealItem.Keys['GSI1PK'] {
    const year = createdAt.getUTCFullYear();
    const month = String(createdAt.getUTCMonth() + 1).padStart(2, '0');
    const date = String(createdAt.getUTCDate()).padStart(2, '0');

    return `MEAL#${accountId}#${year}-${month}-${date}`;
  }

  static GSI1SK(mealId: string): MealItem.Keys['SK'] {
    return `MEAL#${mealId}`;
  }

}

export namespace MealItem {
  export type Type = 'MEAL';

  export type GSI1PKParams = {
    accountId: string;
    createdAt: Date;
  }

  export type Keys = {
    PK: `MEAL#${string}`;
    SK: `MEAL#${string}`;
    GSI1PK: `MEAL#${string}#${string}-${string}-${string}`;
    GSI1SK: `MEAL#${string}`;
  }

  export type Attributes = {
    id: string;
    accountId: string;
    status: Meal.StatusType;
    inputFileKey: string;
    inputType: Meal.InputType;
    attempts?: number;
    name: string;
    icon?: string;
    foods?: Meal.FoodType[];
    createdAt: string;
  }

  export type ItemType = Keys & Attributes & {
    type: Type;
  }

}

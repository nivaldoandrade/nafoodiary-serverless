import { Goal } from '@application/entities/Goal';
import { AccountItem } from '@infra/databases/dynamodb/items/AccountItem';

export class GoalItem {
  static readonly TYPE: GoalItem.Type = 'GOAL';

  private readonly keys: GoalItem.Keys;

  private constructor(private readonly attrs: GoalItem.Attributes) {
    this.keys = {
      PK: GoalItem.getPK(this.attrs.accountId),
      SK: GoalItem.getSK(this.attrs.accountId),
    };
  }

  static fromEntity(goal: Goal): GoalItem {
    return new GoalItem({
      ...goal,
      createdAt: goal.createdAt.toISOString(),
    });
  }

  static toEntity(goalItemAttr: GoalItem.Attributes): Goal {
    return new Goal({
      ...goalItemAttr,
      createdAt: new Date(goalItemAttr.createdAt),
    });
  }

  getItem(): GoalItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: GoalItem.TYPE,
    };
  }

  static getPK(accountId: string): GoalItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): GoalItem.Keys['SK'] {
    return `ACCOUNT#${accountId}#GOAL`;
  }
}

export namespace GoalItem {
  export type Type = 'GOAL';

  export type Keys = {
    PK: AccountItem.Keys['PK'];
    SK: `${AccountItem.Keys['PK']}#GOAL`;
  }

  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    createdAt: string;
  }

  export type ItemType = Keys & Attributes & {
    type: Type
  }
}

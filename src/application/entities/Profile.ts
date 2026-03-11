import { ValueOf } from '@shared/utils/ValueOf';

export class Profile {
  readonly accountId: string;

  name: string;

  birthDate: Date;

  gender: Profile.Gender;

  height: number;

  weight: number;

  activityLevel: Profile.ActivityLevel;

  goal: Profile.Goal;

  readonly createdAt: Date;

  constructor(attr: Profile.Attributes) {
    this.accountId = attr.accountId;
    this.name = attr.name;
    this.birthDate = attr.birthDate;
    this.gender = attr.gender;
    this.height = attr.height;
    this.weight = attr.weight;
    this.activityLevel = attr.activityLevel;
    this.goal = attr.goal;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Profile {

  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: Date;
    gender: Gender;
    height: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Profile.Goal;
    createdAt?: Date;
  }

  export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
  } as const;

  export type Gender = typeof Gender[keyof typeof Gender];

  export const ActivityLevel = {
    SENDENTARY: 'SENDENTARY',
    LIGHT: 'LIGHT',
    MODERATE: 'MODERATE',
    HEAVY: 'HEAVY',
    ATHELETE: 'ATHELETE',
  } as const;

  export type ActivityLevel = ValueOf<typeof ActivityLevel>;

  export const Goal = {
    MAINTAIN: 'MAINTAIN',
    GAIN: 'GAIN',
    LOSE: 'LOSE',
  } as const;

  export type Goal = ValueOf<typeof Goal>;
}

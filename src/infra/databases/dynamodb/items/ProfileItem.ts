import { Profile } from '@application/entities/Profile';
import { AccountItem } from '@infra/databases/dynamodb/items/AccountItem';

export class ProfileItem {
  static readonly TYPE: ProfileItem.Type = 'PROFILE';

  readonly keys: ProfileItem.Keys;

  private constructor(private readonly attrs: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attrs.accountId),
      SK: ProfileItem.getSK(this.attrs.accountId),
    };
  }

  static fromEntity(profile: Profile): ProfileItem {
    return new ProfileItem({
      ...profile,
      birthDate: profile.birthDate.toISOString(),
      createdAt: profile.createdAt.toISOString(),
    });
  }

  static toEntity(profileItemAttr: ProfileItem.Attributes): Profile {
    return new Profile({
      ...profileItemAttr,
      birthDate: new Date(profileItemAttr.birthDate),
      createdAt: new Date(profileItemAttr.createdAt),
    });
  }

  getItem(): ProfileItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: ProfileItem.TYPE,
    };
  }

  static getPK(accountId: string): ProfileItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): ProfileItem.Keys['SK'] {
    return `ACCOUNT#${accountId}#PROFILE`;
  }
}

export namespace ProfileItem {
  export type Type = 'PROFILE';

  export type Keys = {
    PK: AccountItem.Keys['PK'];
    SK: `${AccountItem.Keys['PK']}#PROFILE`;
  }

  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: string;
    gender: Profile.Gender;
    height: number;
    weight: number;
    activityLevel: Profile.ActivityLevel;
    goal: Profile.Goal;
    createdAt: string;
  }

  export type ItemType = Keys & Attributes & {
    type: Type
  }
}

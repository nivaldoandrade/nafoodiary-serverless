
export class Account {
  readonly id: string;

  readonly email: string;

  externalId: string;

  isOnboarded: boolean;

  readonly createdAt: Date;

  constructor(attr: Account.Attributes) {
    this.id = attr.id;
    this.email = attr.email;
    this.externalId = attr.externalId;
    this.isOnboarded = attr.isOnboarded;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

namespace Account {
  export type Attributes = {
    id: string;
    email: string;
    externalId: string;
    isOnboarded: boolean;
    createdAt?: Date
  }
}

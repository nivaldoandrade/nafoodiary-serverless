import KSUID from 'ksuid';

export class Account {
  readonly id: string;

  readonly email: string;

  externalId: string;

  constructor(att: Account.Attributes) {
    this.id = KSUID.randomSync().string;
    this.email = att.email;
    this.externalId = att.externalId;
  }
}

namespace Account {
  export type Attributes = {
    email: string;
    externalId: string;
  }
}

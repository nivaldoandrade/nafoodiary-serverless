
export interface IEventHandler {
  handle(input: IEventHandler.Input): Promise<void>;
}

export namespace IEventHandler {
  export type Input = {
    fileKey: string;
  }
}

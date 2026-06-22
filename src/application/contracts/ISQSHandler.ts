
export interface ISQSHandler<
  TInput extends Record<string, unknown>
  = Record<string, unknown>
> {
  handle(input: TInput): Promise<void>;
}


/* eslint-disable no-console */
import OpenAI, { toFile } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { Meal } from '@application/entities/Meal';
import { getImagePrompt } from '@infra/ai/prompts/getImagePrompt';
import { getTextPrompt } from '@infra/ai/prompts/getTextPrompt';
import { MealFileStorageGateway } from '@infra/gateways/MealFileStorageGateway';
import { downloadByURL } from '@infra/utils/downloadByURL';
import { Injectable } from '@kernel/decorators/Injectable';

const schema = z.object({
  name: z.string(),
  icon: z.string(),
  foods: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      calories: z.number(),
      carbohydrates: z.number(),
      fats: z.number(),
      proteins: z.number(),
    }),
  ),
});

@Injectable()
export class MealAiGateway {
  private readonly client = new OpenAI();

  constructor(
    private readonly mealFileStorageGateway: MealFileStorageGateway,
  ) { }

  async process(meal: Meal): Promise<MealAiGateway.Process['result']> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-5.4-mini',
        input: [
          {
            role: 'system',
            content: getImagePrompt(),
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                image_url: this.mealFileStorageGateway.getFileURL(meal.inputFileKey),
                detail: 'high',
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(schema, 'meal'),
        },
      });

      const { output_text } = response;
      const openAiResponseStringify = JSON.stringify(response, null, 2);

      if (!output_text) {
        console.error(`OPEN AI response: ${openAiResponseStringify}`);
        throw new Error(`OPEN AI error in meal: ${meal.id}`);
      }

      const {
        success,
        data,
        error,
      } = schema.safeParse(JSON.parse(output_text));

      if (!success) {
        console.log(`Zod error: ${JSON.stringify(error.issues, null, 2)}`);
        console.error(`OPEN AI response: ${openAiResponseStringify}`);
        throw new Error(`OPEN AI error in meal: ${meal.id}`);
      }

      return data;
    } catch (error) {
      new Error(`OPEN AI ERROR: ${error}`);
      throw error;
    }
  }

  async transcribe(meal: Meal): Promise<MealAiGateway.Process['result']> {
    const audioUrl = this.mealFileStorageGateway.getFileURL(meal.inputFileKey);
    const audioBuffer = await downloadByURL(audioUrl);

    const transcription = await this.client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file: await toFile(
        audioBuffer,
        'audio.m4a',
        { type: 'audio/m4a' },
      ),
    });

    const { text } = transcription;

    if (!text) {
      console.error(`OPEN AI transcription response: ${JSON.stringify(transcription, null, 2)}`);
      throw new Error(`OPEN AI error in meal: ${meal.id}`);
    }

    const response = await this.client.responses.create({
      model: 'gpt-5.4-mini',
      input: [
        {
          role: 'system',
          content: getTextPrompt(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Meal date: ${meal.createdAt}\n\n Meal: ${text}`,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(schema, 'meal'),
      },
    });

    const { output_text } = response;
    const openAiResponseStringify = JSON.stringify(response, null, 2);

    if (!output_text) {
      console.error(`OPEN AI response: ${openAiResponseStringify}`);
      throw new Error(`OPEN AI error in meal: ${meal.id}`);
    }

    const {
      success,
      data,
      error,
    } = schema.safeParse(JSON.parse(output_text));

    if (!success) {
      console.log(`Zod error: ${JSON.stringify(error.issues, null, 2)}`);
      console.error(`OPEN AI response: ${openAiResponseStringify}`);
      throw new Error(`OPEN AI error in meal: ${meal.id}`);
    }

    return data;
  }
}

export namespace MealAiGateway {
  export type Process = {
    result: z.infer<typeof schema>;
  }
}

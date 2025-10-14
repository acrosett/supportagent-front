// Token-based estimator using tiktoken and BANK tokens pricing
import { encoding_for_model } from "@dqbd/tiktoken";
import { calculateTokensPrice, AiModelType } from "../../BANK-ms/spend/cmds/shared.utils";

export const MAX_DIGEST_TOKENS = 250000;
export const FILE_MAX_SIZE = MAX_DIGEST_TOKENS * 4;
export const FAQ_SPLIT_TOKENS = 50000;

/**
 * Estimate digest price based on token count.
 * Returns -1 if token length exceeds MAX_DIGEST_TOKENS.
 */
export async function estimateStringTokenPrice(fileText: string, aiModelType: AiModelType = AiModelType.SMART, checkMax: boolean = false): Promise<{
      tokenCount: number;
      exceedsMax: boolean;
      price: number;
}> {
      if(checkMax && fileText.length > FILE_MAX_SIZE) {
            return {
                  tokenCount: fileText.length*4,
                  exceedsMax: true,
                  price: -1
            }
      }
      const enc = await encoding_for_model("gpt-5");
      try {
            const tokens = enc.encode(fileText);

            // Price only based on input tokens for digesting
            const price = calculateTokensPrice({ inputTokens: tokens.length, outputTokens: 0, aiModelType });
            return {
                  tokenCount: tokens.length,
                  exceedsMax: tokens.length > MAX_DIGEST_TOKENS,
                  price
            };
      } finally {
            enc.free();
      }
}


export async function estimateFullDigestCost(fileText: string) {

      const aiModelType = AiModelType.SMART;
      let price = 0;
      const firstStep = await estimateStringTokenPrice(fileText, aiModelType, true);

      if (firstStep.exceedsMax) {
            return -1;
      }

      price += firstStep.price;

      const estimatedOutput = firstStep.tokenCount * 0.8;

      let nextStepCount = Math.ceil(estimatedOutput / FAQ_SPLIT_TOKENS);
      const tokenPerStep = Math.min(estimatedOutput, FAQ_SPLIT_TOKENS);

      nextStepCount *= 3.5; //AI search FAQs then read FAQs and then update it with tools, then send result;

      price +=  calculateTokensPrice({
                  inputTokens: tokenPerStep,
                  outputTokens: tokenPerStep,
                  aiModelType
                  }) * nextStepCount;

      return price;
}

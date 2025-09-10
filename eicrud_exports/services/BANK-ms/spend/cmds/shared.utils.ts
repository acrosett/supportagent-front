export enum AiModelType {
    SMART = 'smart',
    FAST = 'fast'
}

const baseInputRatePer1KTokens = 0.0005; // $ per 1K tokens (input)
const baseOutputRatePer1KTokens = 0.004;  // $ per 1K tokens (output)

/**
 * Calculate total price for input/output tokens.
 * Returns a number in dollars.
 */
export function calculateTokensPrice(params: {
	inputTokens?: number;
	outputTokens?: number;
	aiModelType?: AiModelType;
}): number {
	const input = params.inputTokens ?? 0;
	const output = params.outputTokens ?? 0;
	const aiModelType = params.aiModelType ?? AiModelType.FAST;

	let total = (input * baseInputRatePer1KTokens + output * baseOutputRatePer1KTokens) / 1000;

	if (aiModelType == AiModelType.SMART) {
		total *= 2.5; // 2.5x for smart model
	}

	return total;
}

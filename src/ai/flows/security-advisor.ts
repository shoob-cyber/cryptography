'use server';

/**
 * @fileOverview Provides suggestions for improving the key exchange protocol based on current encryption best practices.
 *
 * - getSecurityRecommendations - A function that returns security recommendations.
 * - SecurityRecommendationsInput - The input type for the getSecurityRecommendations function.
 * - SecurityRecommendationsOutput - The return type for the getSecurityRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SecurityRecommendationsInputSchema = z.object({
  keyExchangeProtocol: z
    .string()
    .describe('The current key exchange protocol being used.'),
});
export type SecurityRecommendationsInput = z.infer<
  typeof SecurityRecommendationsInputSchema
>;

const SecurityRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommendations to improve the key exchange protocol.'),
});
export type SecurityRecommendationsOutput = z.infer<
  typeof SecurityRecommendationsOutputSchema
>;

export async function getSecurityRecommendations(
  input: SecurityRecommendationsInput
): Promise<SecurityRecommendationsOutput> {
  return securityAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'securityAdvisorPrompt',
  input: {schema: SecurityRecommendationsInputSchema},
  output: {schema: SecurityRecommendationsOutputSchema},
  prompt: `You are a security expert specializing in key exchange protocols.

You will be provided with the current key exchange protocol being used, and you will provide a list of recommendations to improve it based on current encryption best practices.

Current Key Exchange Protocol: {{{keyExchangeProtocol}}}

Please provide a list of recommendations to improve the key exchange protocol:
`,
});

const securityAdvisorFlow = ai.defineFlow(
  {
    name: 'securityAdvisorFlow',
    inputSchema: SecurityRecommendationsInputSchema,
    outputSchema: SecurityRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

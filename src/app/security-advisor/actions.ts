"use server";

import { getSecurityRecommendations, SecurityRecommendationsInput } from "@/ai/flows/security-advisor";

export async function fetchSecurityRecommendations(input: SecurityRecommendationsInput) {
  try {
    const result = await getSecurityRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching security recommendations:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

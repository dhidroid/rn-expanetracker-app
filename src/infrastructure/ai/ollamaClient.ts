/**
 * Ollama local LLM client.
 * Talks to a locally running Ollama server over the network.
 *
 * Setup: run `ollama serve` on your Mac, then set OLLAMA_BASE_URL
 * to your Mac's local IP, e.g. http://192.168.1.10:11434
 *
 * Default model: llama3 (change below if you have a different model)
 */

import { Expense } from '../../domain/entities';
import { Income } from '../../domain/entities/Income';

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Basic chat completion via Ollama REST API.
 */
export const ollamaChat = async (
  messages: OllamaMessage[],
  model = DEFAULT_MODEL,
): Promise<string> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content ?? '';
};

/**
 * Check if Ollama server is reachable.
 */
export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Generate AI spending insights based on the user's real data.
 */
export const generateSpendingInsights = async (
  expenses: Expense[],
  incomes: Income[],
  model = DEFAULT_MODEL,
): Promise<string> => {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  // Build category summary
  const categorySummary = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categoryText = Object.entries(categorySummary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)}`)
    .join('\n');

  const balanceRatio =
    totalIncome > 0
      ? ((totalExpenses / totalIncome) * 100).toFixed(1)
      : 'N/A';

  const systemPrompt = `You are a helpful personal finance advisor. Analyze the user's spending data and provide clear, actionable money-saving tips and a brief summary. Be concise, friendly, and practical. Format: 3-5 bullet points for tips, then a 2-sentence summary.`;

  const userPrompt = `Here is my spending data for this month:
Total Income: $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Spent ${balanceRatio}% of income

Expenses by category:
${categoryText || '  - No expenses recorded'}

Please give me personalized money-saving tips and a summary.`;

  return ollamaChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model,
  );
};

/**
 * On-device lightweight AI for finance insights.
 * Works offline using rule-based responses and heuristics.
 * Falls back to Ollama for complex queries when available.
 */

import { Expense } from '../../domain/entities';
import { Income } from '../../domain/entities/Income';

interface LocalAIResponse {
  content: string;
  source: 'local' | 'ollama';
}

/**
 * Analyze expenses and generate insights locally.
 */
export const analyzeSpendingLocally = (
  expenses: Expense[],
  incomes: Income[],
): LocalAIResponse => {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const balanceRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;
  const remaining = totalIncome - totalExpenses;

  let insights: string[] = [];

  // Spending analysis
  if (balanceRatio > 0.9) {
    insights.push(
      `⚠️ You've spent ${(balanceRatio * 100).toFixed(0)}% of your income. Consider reducing expenses.`,
    );
  } else if (balanceRatio > 0.7) {
    insights.push(
      `📊 You're using ${(balanceRatio * 100).toFixed(0)}% of income. Room for improvement.`,
    );
  } else {
    insights.push(
      `✅ Good job! You've used only ${(balanceRatio * 100).toFixed(0)}% of your income.`,
    );
  }

  // Top category advice
  if (topCategory) {
    const [category, amount] = topCategory;
    const pct =
      totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : '0';

    switch (category) {
      case 'food':
        insights.push(
          `🍔 Food is ${pct}% of spending ($${amount.toFixed(2)}). Try meal prepping to save.`,
        );
        break;
      case 'transport':
        insights.push(
          `🚗 Transport is ${pct}% ($${amount.toFixed(2)}). Consider carpooling or public transit.`,
        );
        break;
      case 'shopping':
        insights.push(
          `🛍️ Shopping is ${pct}% ($${amount.toFixed(2)}). Wait 24h before non-essential purchases.`,
        );
        break;
      case 'entertainment':
        insights.push(
          `🎬 Entertainment is ${pct}% ($${amount.toFixed(2)}). Look for free events this month.`,
        );
        break;
      case 'bills':
        insights.push(
          `📄 Bills are ${pct}% ($${amount.toFixed(2)}). Review subscriptions you might not need.`,
        );
        break;
      case 'health':
        insights.push(
          `💊 Health spending is ${pct}% ($${amount.toFixed(2)}). Keep up the good work!`,
        );
        break;
      default:
        insights.push(
          `📦 ${category} is ${pct}% of spending ($${amount.toFixed(2)}).`,
        );
    }
  }

  // Savings potential
  if (remaining > 0) {
    insights.push(
      `💰 You have $${remaining.toFixed(2)} remaining this month. Consider saving at least 20%!`,
    );
  }

  return {
    content: insights.join('\n\n'),
    source: 'local',
  };
};

/**
 * Generate saving tips based on expense patterns.
 */
export const generateSavingTipsLocally = (
  expenses: Expense[],
  _incomes: Income[],
): LocalAIResponse => {
  const tips: string[] = [];

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalExpenses = Object.values(categoryTotals).reduce(
    (s, v) => s + v,
    0,
  );

  // Food tips
  const food = categoryTotals.food || 0;
  if (food > totalExpenses * 0.2) {
    tips.push(
      '🥗 Food spending is high. Try meal prepping on Sundays to reduce daily costs.',
    );
    tips.push(
      '🥤 Cut down on coffee runs - making at home can save $100+/month.',
    );
  }

  // Transport tips
  const transport = categoryTotals.transport || 0;
  if (transport > totalExpenses * 0.15) {
    tips.push('🚴 Consider biking or walking for short distances.');
    tips.push('🚌 Use public transit passes instead of ride-sharing.');
  }

  // Shopping tips
  const shopping = categoryTotals.shopping || 0;
  if (shopping > totalExpenses * 0.15) {
    tips.push('🛒 Wait 24-48 hours before impulse purchases.');
    tips.push('📱 Unsubscribe from shopping emails to reduce temptation.');
  }

  // Entertainment tips
  const entertainment = categoryTotals.entertainment || 0;
  if (entertainment > totalExpenses * 0.1) {
    tips.push('🎬 Look for free community events and festivals.');
    tips.push('🎮 Try free mobile games instead of in-app purchases.');
  }

  // General tips
  if (tips.length < 3) {
    tips.push('💳 Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');
    tips.push(
      '📱 Track every expense for a week - awareness leads to savings.',
    );
    tips.push('🎯 Set specific savings goals to stay motivated.');
  }

  return {
    content: tips
      .slice(0, 5)
      .map((tip, i) => `${i + 1}. ${tip}`)
      .join('\n\n'),
    source: 'local',
  };
};

/**
 * Generate monthly summary.
 */
export const generateMonthlySummaryLocally = (
  expenses: Expense[],
  incomes: Income[],
): LocalAIResponse => {
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  let summary = '';

  if (balance >= 0) {
    summary = `✅ You're in the green this month!`;
  } else {
    summary = `⚠️ You've overspent by $${Math.abs(balance).toFixed(2)}.`;
  }

  summary += `\n\n📈 Income: $${totalIncome.toFixed(2)}\n`;
  summary += `💸 Expenses: $${totalExpenses.toFixed(2)}\n`;
  summary += `🏦 ${balance >= 0 ? 'Savings' : 'Deficit'}: $${Math.abs(balance).toFixed(2)}\n`;
  summary += `📊 Savings rate: ${savingsRate.toFixed(1)}%`;

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const top3 = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (top3.length > 0) {
    summary += '\n\n🔝 Top spending categories:';
    top3.forEach(([cat, amt]) => {
      summary += `\n• ${cat}: $${amt.toFixed(2)}`;
    });
  }

  // Outlook
  if (savingsRate >= 20) {
    summary += "\n\n🌟 Excellent! You're on track for healthy savings.";
  } else if (savingsRate >= 0) {
    summary += '\n\n👍 Decent progress. Try to save a bit more each month.';
  } else {
    summary +=
      '\n\n⚡ Focus on reducing your top spending category next month.';
  }

  return { content: summary, source: 'local' };
};

/**
 * Answer common finance questions with local rules.
 */
export const answerFinanceQuestionLocally = (
  question: string,
  expenses: Expense[],
  incomes: Income[],
): LocalAIResponse => {
  const q = question.toLowerCase();

  if (q.includes('save') || q.includes('saving')) {
    return generateSavingTipsLocally(expenses, incomes);
  }

  if (q.includes('spending') || q.includes('spent') || q.includes('analyze')) {
    return analyzeSpendingLocally(expenses, incomes);
  }

  if (q.includes('month') || q.includes('summary') || q.includes('total')) {
    return generateMonthlySummaryLocally(expenses, incomes);
  }

  if (q.includes('budget')) {
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const needs = totalIncome * 0.5;
    const wants = totalIncome * 0.3;
    const savings = totalIncome * 0.2;

    return {
      content:
        `📊 Suggested 50/30/20 Budget:\n\n` +
        `🏠 Needs (50%): $${needs.toFixed(2)}\n` +
        `🎯 Wants (30%): $${wants.toFixed(2)}\n` +
        `💰 Savings (20%): $${savings.toFixed(2)}\n\n` +
        `Adjust based on your actual income.`,
      source: 'local',
    };
  }

  if (q.includes('category') || q.includes('most')) {
    const categoryTotals = expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return {
        content:
          'No expenses recorded yet. Add some expenses to see category breakdown!',
        source: 'local',
      };
    }

    const [top] = sorted;
    return {
      content:
        `📊 Your highest spending category is **${top[0]}** at $${top[1].toFixed(2)}.\n\n` +
        `Full breakdown:\n` +
        sorted
          .map(([cat, amt], i) => `${i + 1}. ${cat}: $${amt.toFixed(2)}`)
          .join('\n'),
      source: 'local',
    };
  }

  // Default response
  return {
    content:
      `I'm your finance assistant! Try asking:\n\n` +
      `• "How can I save money?"\n` +
      `• "Analyze my spending"\n` +
      `• "Monthly summary"\n` +
      `• "What's my budget?"\n` +
      `• "Top spending category"\n\n` +
      `For more advanced AI insights, connect to Ollama on your Mac.`,
    source: 'local',
  };
};

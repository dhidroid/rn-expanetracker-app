/**
 * Local notification service using @notifee/react-native.
 * Handles: low balance alerts, 80% spending threshold, monthly reminders.
 */

import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';

const CHANNEL_ID = 'expense_alerts';
const CHANNEL_NAME = 'Budget Alerts';

export const NotificationService = {
  /**
   * Create the notification channel (Android). Call once on app start.
   */
  async setup() {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  },

  /**
   * Request notification permissions (iOS).
   */
  async requestPermission() {
    await notifee.requestPermission();
  },

  /**
   * Fire an immediate budget alert notification.
   */
  async fireAlert(title: string, body: string) {
    try {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher', // use app icon as fallback
          pressAction: { id: 'default' },
        },
      });
    } catch {
      // Silently fail if notifications are denied or unavailable
    }
  },

  /**
   * Check monthly spending and trigger alerts if thresholds are crossed.
   * Call after every expense add/update.
   */
  async checkAndNotify(totalIncome: number, totalSpent: number) {
    if (totalIncome <= 0) return;

    const spentRatio = totalSpent / totalIncome;
    const balance = totalIncome - totalSpent;

    if (balance <= 0) {
      await NotificationService.fireAlert(
        '🚨 Balance Alert',
        `You've exceeded your monthly income! Current overdraft: $${Math.abs(balance).toFixed(2)}`,
      );
    } else if (spentRatio >= 0.8) {
      const remaining = balance.toFixed(2);
      await NotificationService.fireAlert(
        '⚠️ Budget Warning',
        `You've spent ${(spentRatio * 100).toFixed(0)}% of your income. Only $${remaining} remaining this month.`,
      );
    }
  },

  /**
   * Schedule a monthly summary reminder on the last day of the current month.
   */
  async scheduleMonthlyReminder() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0);
    if (lastDay.getTime() <= Date.now()) return; // Already passed

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: lastDay.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        title: '📊 Monthly Report Ready',
        body: "Your monthly spending summary is ready. Check your reports tab!",
        android: { channelId: CHANNEL_ID },
      },
      trigger,
    );
  },
};

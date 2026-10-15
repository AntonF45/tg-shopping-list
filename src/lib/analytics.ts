const ANALYTICS_KEY = 'shopping_analytics_v1';
const MAX_EVENTS = 500;

export type AnalyticsEvent = 
  | 'app_opened'
  | 'first_item_added'
  | 'item_added'
  | 'item_marked_done'
  | 'item_removed'
  | 'list_cleared'
  | 'list_shared'
  | 'list_created';

export interface AnalyticsPayload {
  totalItems?: number;
  hasQty?: boolean;
  category?: string;
  sharedMethod?: 'native' | 'clipboard';
}

export const logEvent = (event: AnalyticsEvent, payload?: AnalyticsPayload) => {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const events: { event: string; payload?: AnalyticsPayload; timestamp: number }[] = raw ? JSON.parse(raw) : [];
    
    events.push({
      event,
      payload,
      timestamp: Date.now(),
    });

    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Analytics log error', e);
  }
};

export const getInitialListLength = async (): Promise<number> => {
  try {
    const raw = localStorage.getItem('shopping_list_v1');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return parsed.list?.items?.length || 0;
  } catch {
    return 0;
  }
};
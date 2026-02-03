/**
 * Analytics Tracking Hook
 * Use this hook to track user engagement events
 */

export type AnalyticsEventType =
    | 'page_view'
    | 'call_click'
    | 'whatsapp_click'
    | 'website_click'
    | 'directions_click';

export async function trackEvent(
    businessId: string,
    eventType: AnalyticsEventType,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, eventType, metadata })
        });
    } catch (error) {
        console.error('Analytics tracking failed:', error);
    }
}

// Convenience functions
export const trackPageView = (businessId: string) =>
    trackEvent(businessId, 'page_view');

export const trackCallClick = (businessId: string) =>
    trackEvent(businessId, 'call_click');

export const trackWhatsAppClick = (businessId: string) =>
    trackEvent(businessId, 'whatsapp_click');

export const trackWebsiteClick = (businessId: string) =>
    trackEvent(businessId, 'website_click');

export const trackDirectionsClick = (businessId: string) =>
    trackEvent(businessId, 'directions_click');

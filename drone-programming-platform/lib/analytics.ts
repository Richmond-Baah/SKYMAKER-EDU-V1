export const trackHeroEvent = (action: string, variant: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
            event_category: 'Hero',
            event_label: variant,
        });
    } else {
        console.log(`[Analytics Mock] Event: ${action}, Label: ${variant}`);
    }
};

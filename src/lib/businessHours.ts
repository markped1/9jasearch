/**
 * Computes whether a business is currently open or closed based on its hours.
 * Assumes times are in HH:mm format (e.g., "08:00", "18:00").
 * Returns a status object with label and color.
 */
export function getBusinessStatus(openingTime: string | null, closingTime: string | null) {
    if (!openingTime || !closingTime) {
        return { isOpen: true, label: 'Open', color: '#008751', secondary: 'Always open' };
    }

    try {
        // Get current time in Nigeria (UTC+1)
        const now = new Date();
        const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
        const currentHour = watTime.getHours();
        const currentMinute = watTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Parse opening/closing times
        const [openHour, openMinute] = openingTime.split(':').map(Number);
        const [closeHour, closeMinute] = closingTime.split(':').map(Number);

        const openInMinutes = openHour * 60 + openMinute;
        const closeInMinutes = closeHour * 60 + (closeMinute || 0);

        // Handle cases where closing time is after midnight (e.g., 08:00 to 02:00 next day)
        let isOpen = false;
        if (closeInMinutes > openInMinutes) {
            isOpen = currentTimeInMinutes >= openInMinutes && currentTimeInMinutes < closeInMinutes;
        } else {
            // Business stays open past midnight
            isOpen = currentTimeInMinutes >= openInMinutes || currentTimeInMinutes < closeInMinutes;
        }

        if (isOpen) {
            return {
                isOpen: true,
                label: 'Open',
                color: '#008751',
                secondary: `until ${closingTime}`
            };
        } else {
            return {
                isOpen: false,
                label: 'Closed',
                color: '#e53e3e',
                secondary: `opens at ${openingTime}`
            };
        }
    } catch (error) {
        return { isOpen: true, label: 'Open', color: '#008751', secondary: 'Check hours' };
    }
}

/**
 * Smart Query Parser for Natural Language Search
 * Extracts structured intent from conversational queries
 */

import { BUSINESS_CATEGORIES, CATEGORY_ALIASES } from './categories';

// Common location keywords in Nigeria
const NIGERIAN_CITIES = [
    'lagos', 'abuja', 'ibadan', 'kano', 'port harcourt', 'benin', 'calabar',
    'owerri', 'enugu', 'kaduna', 'jos', 'warri', 'ilorin', 'abeokuta',
    'ikeja', 'lekki', 'vi', 'victoria island', 'yaba', 'surulere', 'wuse'
];

// Attribute keywords that describe business qualities
const ATTRIBUTE_KEYWORDS: Record<string, string[]> = {
    quiet: ['quiet', 'peaceful', 'calm', 'relaxed', 'serene'],
    affordable: ['affordable', 'cheap', 'budget', 'low cost', 'inexpensive', 'budget-friendly'],
    luxury: ['luxury', 'premium', 'high-end', 'upscale', 'exclusive', 'expensive'],
    fast: ['fast', 'quick', 'speedy', 'express', 'instant'],
    verified: ['verified', 'trusted', 'certified', 'reliable', 'authentic'],
    open: ['open now', 'open', '24 hours', 'available'],
    rated: ['best rated', 'top rated', 'highest rated', 'popular', 'recommended'],
    near: ['near', 'close to', 'around', 'nearby', 'walking distance'],
    delivery: ['delivery', 'delivers', 'home delivery'],
    family: ['family', 'kid-friendly', 'children', 'family-friendly']
};

// Proximity keywords that indicate related business search
const PROXIMITY_PHRASES = [
    { pattern: /near (?:a |an |the )?(.+)/i, type: 'proximity' },
    { pattern: /close to (?:a |an |the )?(.+)/i, type: 'proximity' },
    { pattern: /with (?:a |an )?(.+) nearby/i, type: 'proximity' }
];

export interface ParsedQuery {
    originalQuery: string;
    category: string | null;
    location: string | null;
    attributes: string[];
    proximityTo: string | null;
    sortBy: 'relevance' | 'rating' | 'reviews';
    intent: 'search' | 'info' | 'help' | 'unknown';
}

export function parseQuery(userInput: string): ParsedQuery {
    const lowerInput = userInput.toLowerCase().trim();

    const result: ParsedQuery = {
        originalQuery: userInput,
        category: null,
        location: null,
        attributes: [],
        proximityTo: null,
        sortBy: 'relevance',
        intent: 'unknown'
    };

    // Detect search intent
    const searchKeywords = ['find', 'locate', 'search', 'show', 'looking for', 'where', 'get me', 'suggest', 'recommend', 'need', 'want'];
    if (searchKeywords.some(k => lowerInput.includes(k))) {
        result.intent = 'search';
    }

    // Extract category
    // 1. Direct match
    let foundCategory = BUSINESS_CATEGORIES.find(cat =>
        lowerInput.includes(cat.toLowerCase())
    );

    // 2. Alias match (if no direct match)
    if (!foundCategory) {
        for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
            if (aliases.some(alias => lowerInput.includes(alias))) {
                foundCategory = category;
                break;
            }
        }
    }

    if (foundCategory) {
        result.category = foundCategory;
        result.intent = 'search';
    }

    // Extract location
    const foundLocation = NIGERIAN_CITIES.find(city =>
        lowerInput.includes(city)
    );
    if (foundLocation) {
        result.location = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
    }

    // Extract attributes
    for (const [attr, keywords] of Object.entries(ATTRIBUTE_KEYWORDS)) {
        if (keywords.some(k => lowerInput.includes(k))) {
            result.attributes.push(attr);
        }
    }

    // Handle "best rated" sorting
    if (result.attributes.includes('rated')) {
        result.sortBy = 'rating';
    }

    // Extract proximity searches (e.g., "hotel near a buka")
    for (const { pattern } of PROXIMITY_PHRASES) {
        const match = lowerInput.match(pattern);
        if (match && match[1]) {
            // Check if the proximity target is a category
            const proximityCategory = BUSINESS_CATEGORIES.find(cat =>
                match[1].toLowerCase().includes(cat.toLowerCase())
            );

            let proximityAliasCategory = null;
            if (!proximityCategory) {
                for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
                    if (aliases.some(alias => match[1].toLowerCase().includes(alias))) {
                        proximityAliasCategory = category;
                        break;
                    }
                }
            }

            if (proximityCategory) {
                result.proximityTo = proximityCategory;
            } else if (proximityAliasCategory) {
                result.proximityTo = proximityAliasCategory;
            } else {
                result.proximityTo = match[1].trim();
            }
        }
    }

    // If we still don't have a category, try to infer from common terms
    if (!result.category) {
        const categoryInferences: Record<string, string> = {
            'hotel': 'Hotels & Resorts',
            'restaurant': 'Restaurants & Cafes',
            'food': 'Restaurants & Cafes',
            'buka': 'Fast Food & Bukas',
            'eat': 'Restaurants & Cafes',
            'mechanic': 'Auto Repairs & Parts',
            'car': 'Automotive Sales',
            'bank': 'Banking & Finance',
            'hospital': 'Hospitals & Clinics',
            'doctor': 'Hospitals & Clinics',
            'lawyer': 'Legal Services',
            'school': 'Schools & Universities',
            'tech': 'Information Technology',
            'computer': 'Information Technology',
            'clothes': 'Fashion & Clothing',
            'tailor': 'Tailoring & Fashion Design',
            'clean': 'Dry Cleaning & Laundry',
            'house': 'Real Estate Agents',
            'land': 'Real Estate Agents',
            'build': 'Construction & Engineering',
            'gym': 'Gyms & Fitness',
            'hair': 'Beauty Salons',
            'barber': 'Barbing Salons',
            'logistics': 'Logistics & Courier',
            'dispatch': 'Dispatch Riders',
            'delivery': 'Logistics & Courier',
            'phone': 'Phone Repairs'
        };

        for (const [term, category] of Object.entries(categoryInferences)) {
            if (lowerInput.includes(term)) {
                result.category = category;
                result.intent = 'search';
                break;
            }
        }
    }

    // Detect info/help intent
    if (lowerInput.includes('how') || lowerInput.includes('what') || lowerInput.includes('help')) {
        if (!result.category && result.intent === 'unknown') {
            result.intent = 'info';
        }
    }

    return result;
}

/**
 * Generate a human-readable summary of parsed query for debugging
 */
export function summarizeParsedQuery(parsed: ParsedQuery): string {
    const parts: string[] = [];

    if (parsed.category) parts.push(`Category: ${parsed.category}`);
    if (parsed.location) parts.push(`Location: ${parsed.location}`);
    if (parsed.attributes.length) parts.push(`Attributes: ${parsed.attributes.join(', ')}`);
    if (parsed.proximityTo) parts.push(`Near: ${parsed.proximityTo}`);
    if (parsed.sortBy !== 'relevance') parts.push(`Sort: ${parsed.sortBy}`);

    return parts.length ? parts.join(' | ') : 'General query';
}

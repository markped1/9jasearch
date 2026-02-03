
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, history } = body;
        const lowerMsg = message.toLowerCase();

        let responseText = "I'm not sure how to help with that yet. You can try searching for 'food', 'hotel', or 'mechanic'.";
        let results: any[] = [];
        let type = 'text'; // text, results

        // Intent: Greeting
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText = "Hello! I'm Eagle Bot. 🦅 I can help you find businesses, deals, or check appointments. What do you need?";
            return NextResponse.json({ text: responseText, type: 'text' });
        }

        // Intent: Search (Simulated NLP)
        const keywords = ['find', 'search', 'looking for', 'need', 'where is'];
        const isSearch = keywords.some(k => lowerMsg.includes(k)) || true; // Default to search if it's not a greeting? 

        // Extract query
        // "Find me a mechanic in Lekki" -> q="mechanic", location="Lekki"
        // Simple logic: remove stop words
        let query = lowerMsg.replace(/find|search|looking|for|need|a|me|in|near/g, '').trim();

        if (query.length > 2) {
            const businesses = await prisma.business.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { category: { contains: query } },
                        { description: { contains: query } },
                        { tags: { contains: query } }
                    ],
                    isActive: true
                },
                take: 3,
                select: { id: true, name: true, slug: true, category: true, city: true, rating: true, logo: true, images: true }
            });

            if (businesses.length > 0) {
                responseText = `I found ${businesses.length} matches for "${query}":`;
                results = businesses;
                type = 'results';
            } else {
                responseText = `I couldn't find anything matching "${query}". Try a different keyword like "Food" or "Hotel".`;
            }
        }

        return NextResponse.json({ text: responseText, results, type });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export const BUSINESS_CATEGORIES = [
    // Hospitality & Food
    "Hotels & Resorts",
    "Restaurants & Cafes",
    "Fast Food & Bukas",
    "Bakery & Confectionery",
    "Catering Services",

    // Technology & IT
    "Information Technology",
    "Software Development",
    "Telecommunications",
    "Electronics & Gadgets",

    // Healthcare
    "Hospitals & Clinics",
    "Pharmacies",
    "Veterinary Services",

    // Retail & Trade
    "Supermarkets",
    "Buying & Selling",
    "Shop Owners",
    "E-commerce",
    "Fashion & Clothing",
    "Furniture & Decor",
    "Arts & Crafts",

    // Finance & Professional
    "Banking & Finance",
    "Insurance",
    "Legal Services",
    "Business Consultancy",

    // Automotive
    "Automotive Sales",
    "Auto Repairs & Parts",
    "Car Wash",
    "Tyre Services",

    // Construction & Building
    "Construction & Engineering",
    "Bricklayers & Masons",
    "Block Industry",
    "Plumbing & Electrical",
    "Welding & Fabrication",
    "Carpenters & Woodwork",
    "Aluminium & Steel Works",
    "Painters & Decorators",
    "Interior Design",
    "Real Estate Agents",
    "Property Developers",

    // Agriculture
    "Agriculture & Agrotech",
    "Poultry & Livestock",
    "Fish Farming",

    // Education
    "Schools & Universities",
    "Private Tutors",
    "Driving Schools",

    // Personal Services
    "Dry Cleaning & Laundry",
    "Beauty Salons",
    "Barbing Salons",
    "Spas & Wellness Center",
    "Gyms & Fitness",
    "Tailoring & Fashion Design",

    // Entertainment & Events
    "Nightclubs & Lounges",
    "Cinemas",
    "Event Planning",
    "DJ & Sound Rentals",
    "Photography & Video",
    "Sports & Recreation",

    // Media & Creative
    "Media & Journalism",
    "Advertising & PR",
    "Graphic Design",
    "Digital Marketing",
    "Printing & Publishing",

    // Industrial & Manufacturing
    "Manufacturing",
    "Oil & Gas Services",
    "Water Supply & Boreholes",
    "Solar & Renewable Energy",
    "Generator Sales & Repairs",

    // Logistics & Transport
    "Logistics & Courier",
    "Haulage & Trucking",
    "Dispatch Riders",
    "Travel & Tourism",

    // Cleaning & Sanitation
    "Industrial Cleaning",
    "Fumigation & Pest Control",
    "Waste Management",

    // Security & Safety
    "Security Services",
    "Fire Safety & Extinguishers",

    // Other Services
    "Phone Repairs",
    "Computer Repairs",
    "AC & Refrigeration",
    "POS Services",
    "Betting & Gaming Shops",
    "Filling Stations",
    "NGOs & Foundations",
    "Government Services"
];

// Subcategory aliases for search matching
export const CATEGORY_ALIASES: Record<string, string[]> = {
    "Buying & Selling": ["trader", "merchant", "wholesale", "retail", "mall", "market", "store"],
    "Shop Owners": ["kiosk", "mini mart", "provision", "store owner"],
    "Car Wash": ["auto wash", "car detailing", "car cleaning"],
    "Bricklayers & Masons": ["bricklayer", "mason", "block layer", "concrete"],
    "Block Industry": ["cement blocks", "block moulding", "interlocking stones"],
    "Dry Cleaning & Laundry": ["laundry", "dry cleaner", "ironing", "pressing"],
    "Welding & Fabrication": ["welder", "fabricator", "iron works", "gate"],
    "Barbing Salons": ["barber", "haircut", "clipper"],
    "Generator Sales & Repairs": ["generator", "gen repair", "inverter"],
    "Phone Repairs": ["phone fix", "screen repair", "mobile repair"],
    "Dispatch Riders": ["delivery", "okada", "bike courier"],
    "POS Services": ["point of sale", "pos agent", "cash withdrawal"]
};

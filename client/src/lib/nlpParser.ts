/**
 * Natural Language Parser for Shop Query
 * Converts natural language queries like "7-year-old who loves building" 
 * into structured filter payloads
 */

// Age word to range mapping
const AGE_WORDS: Record<string, string> = {
  newborn: "Newborn to 18 months",
  infant: "Newborn to 18 months",
  baby: "Newborn to 18 months",
  toddler: "18 months to 3 years",
  preschooler: "2 to 5 years",
  kindergartener: "4 to 7 years",
  "grade-schooler": "5 to 8 years",
  "grade schooler": "5 to 8 years",
  elementary: "6 to 9 years",
  tween: "10 to Early Teens",
  preteen: "10 to Early Teens",
  teen: "Preteens to Older Teens",
  teenager: "Preteens to Older Teens",
};

// Interest to filter mapping
interface FilterMapping {
  categories: string[];
  playTypes: string[];
}

const INTEREST_SYNONYMS: Record<string, FilterMapping> = {
  building: {
    categories: ["building"],
    playTypes: ["building_toys", "construction"],
  },
  construction: {
    categories: ["building"],
    playTypes: ["construction"],
  },
  lego: {
    categories: ["building"],
    playTypes: ["building_toys"],
  },
  blocks: {
    categories: ["building"],
    playTypes: ["building_toys"],
  },
  pretend: {
    categories: ["pretend"],
    playTypes: ["pretend_play", "imagination"],
  },
  "dress up": {
    categories: ["pretend"],
    playTypes: ["pretend_play"],
  },
  "dress-up": {
    categories: ["pretend"],
    playTypes: ["pretend_play"],
  },
  dolls: {
    categories: ["pretend"],
    playTypes: ["pretend_play"],
  },
  puppets: {
    categories: ["pretend"],
    playTypes: ["pretend_play"],
  },
  puzzles: {
    categories: ["cognitive"],
    playTypes: ["puzzles"],
  },
  jigsaw: {
    categories: ["cognitive"],
    playTypes: ["puzzles"],
  },
  logic: {
    categories: ["cognitive"],
    playTypes: ["logic_games"],
  },
  strategy: {
    categories: ["cognitive"],
    playTypes: ["logic_games"],
  },
  chess: {
    categories: ["cognitive"],
    playTypes: ["logic_games"],
  },
  "board games": {
    categories: ["games"],
    playTypes: ["group_games"],
  },
  "card games": {
    categories: ["games"],
    playTypes: ["group_games"],
  },
  games: {
    categories: ["games"],
    playTypes: ["group_games"],
  },
  sensory: {
    categories: ["sensory"],
    playTypes: ["sensory_toys", "textures"],
  },
  fidgets: {
    categories: ["sensory"],
    playTypes: ["sensory_toys"],
  },
  textures: {
    categories: ["sensory"],
    playTypes: ["textures"],
  },
  "fine motor": {
    categories: ["fine motor"],
    playTypes: [],
  },
  beads: {
    categories: ["fine motor"],
    playTypes: ["crafts"],
  },
  lacing: {
    categories: ["fine motor"],
    playTypes: ["crafts"],
  },
  "gross motor": {
    categories: ["gross motor"],
    playTypes: ["active_play"],
  },
  climbing: {
    categories: ["gross motor"],
    playTypes: ["active_play"],
  },
  balance: {
    categories: ["gross motor"],
    playTypes: ["active_play"],
  },
  sports: {
    categories: ["gross motor"],
    playTypes: ["sports", "active_play"],
  },
  outdoor: {
    categories: ["gross motor"],
    playTypes: ["active_play"],
  },
  art: {
    categories: ["art"],
    playTypes: ["art_supplies", "crafts"],
  },
  drawing: {
    categories: ["art"],
    playTypes: ["art_supplies"],
  },
  painting: {
    categories: ["art"],
    playTypes: ["art_supplies"],
  },
  crafts: {
    categories: ["art"],
    playTypes: ["crafts"],
  },
  "craft kits": {
    categories: ["art"],
    playTypes: ["crafts"],
  },
  music: {
    categories: ["music"],
    playTypes: [],
  },
  dance: {
    categories: ["music"],
    playTypes: ["active_play"],
  },
  instruments: {
    categories: ["music"],
    playTypes: [],
  },
  science: {
    categories: ["stem"],
    playTypes: [],
  },
  stem: {
    categories: ["stem"],
    playTypes: [],
  },
  robots: {
    categories: ["stem"],
    playTypes: [],
  },
  coding: {
    categories: ["stem"],
    playTypes: [],
  },
  experiments: {
    categories: ["stem"],
    playTypes: [],
  },
  reading: {
    categories: ["language"],
    playTypes: [],
  },
  language: {
    categories: ["language"],
    playTypes: [],
  },
  books: {
    categories: ["language"],
    playTypes: [],
  },
  speech: {
    categories: ["language"],
    playTypes: [],
  },
  storytelling: {
    categories: ["language"],
    playTypes: [],
  },
  social: {
    categories: ["social"],
    playTypes: ["social_interaction"],
  },
  feelings: {
    categories: ["social"],
    playTypes: ["social_interaction"],
  },
  sel: {
    categories: ["social"],
    playTypes: ["social_interaction"],
  },
  "social skills": {
    categories: ["social"],
    playTypes: ["social_interaction"],
  },
};

// Age number to age range mapping
function mapAgeToRange(age: number): string | null {
  if (age >= 0 && age < 1.5) return "Newborn to 18 months";
  if (age >= 1.5 && age < 3) return "18 months to 3 years";
  if (age >= 2 && age < 5) return "2 to 5 years";
  if (age >= 3 && age < 6) return "3 to 6 years";
  if (age >= 4 && age < 7) return "4 to 7 years";
  if (age >= 5 && age < 8) return "5 to 8 years";
  if (age >= 6 && age < 9) return "6 to 9 years";
  if (age >= 7 && age < 10) return "7 to 10 years";
  if (age >= 8 && age < 11) return "8 to 11 years";
  if (age >= 9 && age < 12) return "9 to 12 years";
  if (age >= 10 && age < 13) return "10 to Early Teens";
  if (age >= 12) return "Preteens to Older Teens";
  return null;
}

// Normalize input string
function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, "-");
}

// Extract age from query
function extractAge(query: string): string | null {
  // Try explicit range first: "4-7 year old" or "4 to 7 year old"
  const rangeMatch = query.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*year[- ]?old/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const mid = Math.floor((start + end) / 2);
    return mapAgeToRange(mid);
  }

  // Try single age: "7 year old" or "7-year-old"
  const singleMatch = query.match(/(\d{1,2})\s*year[- ]?old/);
  if (singleMatch) {
    const age = parseInt(singleMatch[1]);
    return mapAgeToRange(age);
  }

  // Try age words
  for (const [word, range] of Object.entries(AGE_WORDS)) {
    if (query.includes(word)) {
      return range;
    }
  }

  return null;
}

// Extract interests from query
function extractInterests(query: string): string[] {
  const cueWords = [
    "likes",
    "loves",
    "into",
    "interested in",
    "obsessed with",
    "enjoys",
    "is all about",
    "prefers",
    "wants",
    "fans of",
    "who loves",
    "who likes",
    "who's into",
  ];

  let interests: string[] = [];

  // Find cue words and extract what follows
  for (const cue of cueWords) {
    const index = query.indexOf(cue);
    if (index !== -1) {
      const afterCue = query.substring(index + cue.length).trim();
      // Split by common delimiters
      const parts = afterCue
        .split(/\s+and\s+|\s+or\s+|,/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      interests.push(...parts);
      break; // Only process first cue match
    }
  }

  return interests;
}

// Map interests to filters
function mapInterests(interests: string[]): FilterMapping {
  const categories = new Set<string>();
  const playTypes = new Set<string>();

  for (const interest of interests) {
    // Try exact match first
    if (INTEREST_SYNONYMS[interest]) {
      const mapping = INTEREST_SYNONYMS[interest];
      mapping.categories.forEach((c) => categories.add(c));
      mapping.playTypes.forEach((p) => playTypes.add(p));
      continue;
    }

    // Try partial match (interest contains synonym)
    for (const [synonym, mapping] of Object.entries(INTEREST_SYNONYMS)) {
      if (interest.includes(synonym)) {
        mapping.categories.forEach((c) => categories.add(c));
        mapping.playTypes.forEach((p) => playTypes.add(p));
        break;
      }
    }
  }

  return {
    categories: Array.from(categories),
    playTypes: Array.from(playTypes),
  };
}

// Main parser function
export interface ParsedQuery {
  ageRange: string | null;
  categories: string[];
  playTypes: string[];
  hasResults: boolean;
}

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const normalized = normalize(query);

  // Extract age
  const ageRange = extractAge(normalized);

  // Extract and map interests
  const interests = extractInterests(normalized);
  const mapped = mapInterests(interests);

  const hasResults = ageRange !== null || mapped.categories.length > 0 || mapped.playTypes.length > 0;

  return {
    ageRange,
    categories: mapped.categories,
    playTypes: mapped.playTypes,
    hasResults,
  };
}

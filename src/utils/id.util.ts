import { customAlphabet } from 'nanoid';

// Google Meet uses only letters (no numbers)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Total letters = 10 (3 + 4 + 3)
const nanoid10 = customAlphabet(ALPHABET, 10);

/**
 * Generates a Google Meet-like ID (e.g., "abc-defg-hij")
 */
export function generateMeetLikeId(): string {
    const id = nanoid10(); // e.g. "abcdxyzqwe"
    return `${id.slice(0, 3)}-${id.slice(3, 7)}-${id.slice(7, 10)}`;
}

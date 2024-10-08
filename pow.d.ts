/**
 * Generates a cryptographic quiz based on the arguments provided.
 * @param tries - The maximum number of combinations to guess before finding the solution (default: 2^20 or 1048576).
 * @param B - The length of the buffer OR a given buffer (default: 64).
 * @param a1 - The lowest value a byte can be (default: 0).
 * @param a2 - The highest value a byte can be plus one (default: 256).
 * @returns A tuple containing the cryptographic quiz and the solution.
 */
export function makeTest(tries?: number, B?: number|Buffer, a1?: number, a2?: number): [string, string];

/**
 * Solves a cryptographic quiz based on the provided input string.
 * @param input - A string representing the cryptographic quiz.
 * @returns A string representing the solution of the cryptographic quiz.
 */
export function takeTest(input: string): string;

/**
 * Uses a worker thread to solve a cryptographic quiz based on the provided input string to avoid blocking the process.
 * @param input - A string representing the cryptographic quiz.
 * @returns A promise that resolves to a string representing the solution of the cryptographic quiz.
 */
export function takeTestAsync(input: string): Promise<string>;
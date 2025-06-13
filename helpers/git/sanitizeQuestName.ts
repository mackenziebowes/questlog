/**
 * Sanitizes the quest name to ensure it is safe for use in shell commands.
 * @param questName - The name of the quest (branch) to sanitize.
 * @returns The sanitized quest name.
 */
export function sanitizeQuestName(questName: string): string {
	// Allow only alphanumeric characters, dashes, underscores, and slashes
	const sanitized = questName.replace(/[^a-zA-Z0-9-_\/]/g, "");

	if (!sanitized) {
		throw new Error("Invalid quest name. It must contain valid characters.");
	}

	return sanitized;
}

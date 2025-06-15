export function progressBar(
	finished: number,
	total: number,
	width = 30,
	options?: { completeChar?: string; incompleteChar?: string }
): string {
	const { completeChar = "█", incompleteChar = "░" } = options || {};
	const ratio = total === 0 ? 0 : finished / total;
	const filled = Math.round(ratio * width);
	const empty = width - filled;

	let bar = "";
	if (filled > 0) {
		bar += completeChar.repeat(filled);
	}
	if (empty > 0) {
		bar += incompleteChar.repeat(empty);
	}
	const percent = Math.round(ratio * 100);

	return `[${bar}] ${percent}%`;
}

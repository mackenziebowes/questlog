export const msToHumanReadable = (ms: number): string => {
	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor(ms / (1000 * 60 * 60));

	const hoursStr = hours > 0 ? `${hours}h ` : "";
	const minutesStr = minutes > 0 ? `${minutes}m ` : "";
	const secondsStr = `${seconds}s`;

	return `${hoursStr}${minutesStr}${secondsStr}`.trim();
};

export const msToMinutes = (ms: number): number => {
	const minutes = ms / (1000 * 60);
	return parseFloat(minutes.toFixed(2));
};

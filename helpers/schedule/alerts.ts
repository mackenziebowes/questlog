export function syncWithSystemClock(callback: () => void): void {
	const syncInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

	function calculateDelay(): number {
		const now = new Date();
		const msSinceLastInterval =
			(now.getMinutes() % 5) * 60 * 1000 +
			now.getSeconds() * 1000 +
			now.getMilliseconds();
		return syncInterval - msSinceLastInterval;
	}

	function startInterval(): void {
		callback();
		setInterval(callback, syncInterval);
	}

	const initialDelay = calculateDelay();
	setTimeout(startInterval, initialDelay);
}

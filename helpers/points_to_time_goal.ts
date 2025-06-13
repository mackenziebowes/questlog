const table = `
md
| Points     | Description                                   | Example                                |
| ---------- | --------------------------------------------- | -------------------------------------- |
| 1 point    | < 1 hour, shallow logic or isolated component | Button UI, helper function, Zod schema |
| 2 points   | 1-2 hrs, minor feature or integration         | Auth callback handler, Stripe checkout |
| 3 points   | 2-4 hrs, meaningful logic or new page         | Single-product flow with LLM call      |
| 5 points   | ½ day+, multiple moving parts                 | OAuth + DB wiring, batch queuing       |
| 8 points   | Full-day+ spike, nontrivial architecture      | m*n batch worker + progress eventing   |
| 13+ points | Multiple days, high risk/unknowns             | A/B infra, analytics with time series  |
`;

export function pointsToMinutes(points: number): number {
	return Math.round(points * 60 * (1 + (points - 1) * 0.5));
}

export function constructPointsMessage(
	elapsedMinutes: number,
	pointsEstimate: number,
	wiggleRoomPercent: number = 5
): string {
	if (pointsEstimate === 0) {
		return "";
	}

	const expectedMinutes = pointsToMinutes(pointsEstimate);
	const ratio = Math.floor((elapsedMinutes / expectedMinutes) * 100);

	const lowerBound = 100 - wiggleRoomPercent;
	const upperBound = 100 + wiggleRoomPercent;

	if (ratio < lowerBound) {
		const fasterPercentage = 100 - ratio;
		return `You completed the task ${fasterPercentage}% faster than expected.`;
	} else if (ratio >= lowerBound && ratio <= upperBound) {
		return "Great pacing! You completed the task close to the estimated time.";
	} else {
		const slowerPercentage = ratio - 100;
		return `You took ${slowerPercentage}% longer than expected.`;
	}
}

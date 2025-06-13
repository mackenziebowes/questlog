import { state, StateOptions } from "../state";
import quest from "../quest_handling";
import { progressBar } from "../progress";
import { msToHumanReadable, msToMinutes } from "../time";
import { pointsToMinutes } from "../points_to_time_goal";

export function displayStats() {
	const currentQuestId = state.get(StateOptions.CurrentQuestId) as
		| number
		| undefined;
	if (!currentQuestId) {
		return { ok: false, data: "🏰 No Quest started." };
	}
	let currentQuest = quest.quests.get(currentQuestId);
	if (!currentQuest) {
		return { ok: false, data: "🏰 No Quest started." };
	}
	const messages: string[] = [];
	messages.push(`\n[Current Step Stats]\n`);
	messages.push(`[Name]: ${currentQuest.name}\n`);
	messages.push(`[Description]: ${currentQuest.description}\n`);
	if (currentQuest.timeStarted) {
		const now = new Date();
		const time = now.getTime() - currentQuest.timeStarted.getTime();
		messages.push(`[Time Spent]: ${msToHumanReadable(time)}\n`);
		let pointsEstimate = pointsToMinutes(currentQuest.points);
		const timeSpentMinutes = msToMinutes(time);
		const percentageUsed = ((timeSpentMinutes / pointsEstimate) * 100).toFixed(
			2
		);
		if (pointsEstimate > timeSpentMinutes) {
			messages.push(
				`[Estimated Time Remaining]: ${
					pointsEstimate - timeSpentMinutes
				} minutes.\n`
			);
		}
		messages.push(`[Used]: ${percentageUsed}% of estimated time\n`);
	}
	messages.push(`\n[Quest Stats]\n`);
	let numQuests = quest.quests.size;
	let numQuestsFinished = state.get(StateOptions.NumQuestsFinished) as
		| number
		| undefined;
	if (numQuestsFinished) {
		messages.push(
			`[Progress:]\n${progressBar(numQuestsFinished, numQuests)}\n`
		);
	}
	const timeElapsed = state.get(StateOptions.TimeElapsed) as number | undefined;
	if (timeElapsed) {
		messages.push(`[Total Project Time]: ${msToHumanReadable(timeElapsed)}\n`);
	}
	if (!numQuestsFinished && !timeElapsed) {
		messages.push(`Complete a Quest Step to see your Quest Stats\n`);
	}
	return {
		ok: true,
		data: messages.join(""),
	};
}

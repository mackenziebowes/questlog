import { loadState, state, StateOptions } from "../state";
import quest from "../quest_handling";
import { progressBar } from "../progress";
import { msToHumanReadable, msToMinutes } from "../time";
import { pointsToMinutes } from "../points_to_time_goal";
import fig from "../decorators/figlet";
import * as p from "@clack/prompts";

function isQuestLineComplete() {
	loadState();
	const numQuests = (state.get(StateOptions.NumQuests) as number) || undefined;
	const questsCompleted =
		(state.get(StateOptions.NumQuestsFinished) as number) || undefined;
	if (!numQuests || !questsCompleted) {
		return { ok: false, result: false };
	}
	if (numQuests == questsCompleted) {
		return { ok: true, result: true };
	}
	return { ok: true, result: false };
}

export function displayStats() {
	const isComplete = isQuestLineComplete();
	const messages: string[] = [];
	let time: number = 0;
	if (isComplete.ok == true && isComplete.result == false) {
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
		messages.push(`\n[Current Step Stats]\n`);
		messages.push(`[Name]: ${currentQuest.name}\n`);
		messages.push(`[Description]: ${currentQuest.description}\n`);

		if (currentQuest.timeStarted) {
			const now = new Date();
			time = now.getTime() - currentQuest.timeStarted.getTime();
			messages.push(`[Time Spent]: ${msToHumanReadable(time)}\n`);
			let pointsEstimate = pointsToMinutes(currentQuest.points);
			const timeSpentMinutes = msToMinutes(time);
			const percentageUsed = (
				(timeSpentMinutes / pointsEstimate) *
				100
			).toFixed(2);
			if (pointsEstimate > timeSpentMinutes) {
				messages.push(
					`[Estimated Time Remaining]: ${(
						pointsEstimate - timeSpentMinutes
					).toFixed(1)}0 minutes.\n`
				);
			}
			messages.push(`[Used]: ${percentageUsed}% of estimated time\n`);
		}
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
	const timeElapsed =
		(state.get(StateOptions.TimeElapsed) as number | undefined) || 0;
	messages.push(
		`[Total Project Time]: ${msToHumanReadable(timeElapsed + time)}\n`
	);
	if (!numQuestsFinished && !timeElapsed) {
		messages.push(
			`Complete a Quest Step to see the rest of your Quest Stats\n`
		);
	}
	return {
		ok: true,
		data: messages.join(""),
	};
}

export function renderStats() {
	fig.title.p("CTQL");
	fig.subtitle.p("stats");
	quest.load();
	const statsRes = displayStats();
	if (statsRes.ok) {
		p.log.info(statsRes.data);
		console.log("use [ctrl+d] to mark complete, [q] to quit process");
	} else {
		p.log.warn(statsRes.data);
	}
}

let intervalId: NodeJS.Timeout | null;
let isPaused = false;

function startInterval() {
	if (!isPaused) {
		intervalId = setInterval(() => {
			renderStats();
		}, 1000);
	}
}

function pauseInterval() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
		isPaused = true;
		console.log("Paused.");
	}
}

function resumeInterval() {
	if (isPaused) {
		isPaused = false;
		startInterval();
	}
}

const render = {
	do: renderStats,
	start: startInterval,
	pause: pauseInterval,
	resume: resumeInterval,
};

export default render;

import quest from "../quest_handling";
import { state, loadState, saveState, StateOptions } from "../state";
import { TomlDate } from "smol-toml";
import { confetti } from "./confetti";
import git from "../git";
import { NextQuest } from "./nextQuest";
import { msToHumanReadable, msToMinutes } from "../time";
import { constructPointsMessage } from "../points_to_time_goal";
import { QuestStepStatus } from "../types";
import { progressBar } from "../decorators/progress";
import type { HelperResponse } from "../types";
import { emitWarning } from "node:process";

export async function FinishQuest(): Promise<HelperResponse> {
	try {
		// -- Defensive Validation ---
		const currentQuestId = state.get(StateOptions.CurrentQuestId) as
			| number
			| undefined;
		if (!currentQuestId) {
			throw new Error("❌ No Quest to Finish!");
		}
		const currentQuest = quest.quests.get(currentQuestId);
		if (!currentQuest) {
			throw new Error("❌ No Quest to Finish!");
		}
		const now = new Date();
		currentQuest.timeFinished = new TomlDate(now);
		currentQuest.status = QuestStepStatus.FINISHED;
		let timeMsg = "";
		// -- More Defensive Validation ---
		let totalTimeElapsed = state.get(StateOptions.TimeElapsed);
		if (totalTimeElapsed === undefined || totalTimeElapsed === null) {
			totalTimeElapsed = 0;
		} else if (typeof totalTimeElapsed !== "number") {
			const parsedValue = parseInt(totalTimeElapsed as string, 10);
			if (isNaN(parsedValue)) {
				totalTimeElapsed = 0;
			} else {
				totalTimeElapsed = parsedValue;
			}
		}
		let pointsMsg = "";
		if (currentQuest.timeStarted && currentQuest.timeStarted instanceof Date) {
			const timeElapsed =
				now.getTime() -
				new Date(currentQuest.timeStarted.toISOString()).getTime();
			timeMsg = `⏳ [Time]: ${msToHumanReadable(timeElapsed)}`;
			const elapsedMinutes = msToMinutes(timeElapsed);
			pointsMsg = constructPointsMessage(elapsedMinutes, currentQuest.points);
			state.set(
				StateOptions.TimeElapsed,
				timeElapsed + (totalTimeElapsed || 0)
			);
			saveState({
				updates: {
					[StateOptions.TimeElapsed]: timeElapsed + (totalTimeElapsed || 0),
				},
			});
		} else {
			timeMsg = "⚠️ Quest start time is not available.";
		}
		const autogit = state.get(StateOptions.AutoGit) as boolean | undefined;
		if (autogit) {
			git.commit(currentQuest.name);
		}
		quest.quests.set(currentQuest.id, currentQuest);
		// Guard before increment quests complete counter ---
		let currentNumQuestsFinished = state.get(StateOptions.NumQuestsFinished);
		if (typeof currentNumQuestsFinished !== "number") {
			if (typeof currentNumQuestsFinished !== "string") {
				state.set(StateOptions.NumQuestsFinished, 0);
				currentNumQuestsFinished = 0;
			} else {
				currentNumQuestsFinished = parseInt(currentNumQuestsFinished);
				state.set(StateOptions.NumQuestsFinished, currentNumQuestsFinished);
			}
		}
		// -- The Big Increment ----
		currentNumQuestsFinished++;
		state.set(StateOptions.NumQuestsFinished, currentNumQuestsFinished);
		saveState({
			updates: {
				[StateOptions.NumQuestsFinished]: currentNumQuestsFinished,
			},
		});

		// -- UI ----
		let numQuests = state.get(StateOptions.NumQuests);
		// -- UI Defense --
		if (typeof numQuests !== "number") {
			if (typeof numQuests !== "string") {
				state.set(StateOptions.NumQuests, 0);
				numQuests = 0;
			} else {
				numQuests = parseInt(numQuests);
				state.set(StateOptions.NumQuests, numQuests);
			}
		}
		// -- Display Progress --
		let progressMsg = "";
		if (numQuests && currentNumQuestsFinished) {
			progressMsg = progressBar(currentNumQuestsFinished, numQuests);
		}

		// -- Questline May Be Complete! ---
		if (quest.quests.has(currentQuestId + 1)) {
			const preparedMessages = [`✨ [Complete]: ${currentQuest.name}`, timeMsg];
			if (pointsMsg.length > 0) {
				preparedMessages.push(pointsMsg);
			}
			await confetti({
				duration: 2000,
				messages: preparedMessages,
				progressMsg: progressMsg.length > 0 ? progressMsg : undefined,
			});
			const nextResponse = await NextQuest(currentQuestId);
			if (!nextResponse.ok) {
				throw new Error(nextResponse.err);
			}
			return {
				ok: true,
				data: nextResponse.data,
			};
		} else {
			// -- Questline Complete!! ---
			const preparedMessages = [
				`✨ [Complete]: ${currentQuest.name}`,
				`🏰 All Quests Complete!`,
			];
			if (!timeMsg.includes("⚠️")) {
				preparedMessages.push(timeMsg);
			}
			totalTimeElapsed = state.get(StateOptions.TimeElapsed) as
				| number
				| undefined;
			if (totalTimeElapsed) {
				preparedMessages.push(
					`🏕️ Completed in ${msToHumanReadable(totalTimeElapsed)}`
				);
			}
			await confetti({
				duration: 5000,
				messages: preparedMessages,
				progressMsg: progressMsg.length > 0 ? progressMsg : undefined,
			});
			return {
				ok: true,
				data: "Awesome Job!",
			};
		}
	} catch (err) {
		if (err instanceof Error) {
			return {
				ok: false,
				err: err.message,
			};
		} else {
			return {
				ok: false,
				err: "Failed to load quest.",
			};
		}
	}
}

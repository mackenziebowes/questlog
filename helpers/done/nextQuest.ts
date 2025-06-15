import quest from "../quest_handling";
import {
	type LoadedQuests,
	type HelperResponse,
	QuestStepStatus,
} from "../types";
import { state, saveState, StateOptions } from "../state";
import { TomlDate } from "smol-toml";
import git from "../git";
import { pointsToMinutes } from "../points_to_time_goal";

// only called from FinishQuest which handles being the last quest.
// next quest is guaranteed to exist, basically.
export async function NextQuest(
	currentQuestId: number
): Promise<HelperResponse> {
	try {
		const nextQuestId = currentQuestId + 1;
		const nextQuest = quest.quests.get(nextQuestId);
		if (!nextQuest) {
			// theoretically unreachable under normal conditions
			throw new Error("❌ No Quest to Start!");
		}
		state.set(StateOptions.CurrentQuestId, nextQuestId);
		saveState({
			updates: {
				[StateOptions.CurrentQuestId]: nextQuestId.toString(),
			},
		});
		const now = new Date();
		nextQuest.status = QuestStepStatus.STARTED;
		nextQuest.timeStarted = new TomlDate(now);
		const autogit = state.get(StateOptions.AutoGit);
		if (autogit) {
			git.guard();
			git.checkout(nextQuest.name);
		}
		saveState();
		quest.save();
		return {
			ok: true,
			data: {
				msg: `[⚔️ Started: ${nextQuest.name}]\n[⏱️ Time Goal: ${pointsToMinutes(
					nextQuest.points
				)} minutes.]`,
				name: nextQuest.name,
			},
		};
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

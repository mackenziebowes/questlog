import type { HelperResponse, LoadedQuest, CTQLState } from "../types";
import { QuestStepStatus } from "../types";
import { TomlDate } from "smol-toml";
import { pointsToMinutes } from "../points_to_time_goal";
import quest from "../quest_handling";
import { saveState, state, StateOptions } from "../state";

export function startQuest(
	loadedQuests: Map<number, LoadedQuest>
): HelperResponse {
	try {
		const nextQuest = quest.first(loadedQuests);
		if (!nextQuest) {
			throw new Error("❌ Could not find non-pending quests in memory.");
		}
		const now = new Date();
		nextQuest.status = QuestStepStatus.STARTED;
		nextQuest.timeStarted = new TomlDate(now);
		loadedQuests.set(nextQuest.id, nextQuest);
		state.set(StateOptions.CurrentQuestId, nextQuest.id);
		state.set(StateOptions.NumQuests, loadedQuests.size);
		saveState({
			updates: {
				[StateOptions.CurrentQuestId]: nextQuest.id.toString(),
				[StateOptions.NumQuests]: loadedQuests.size.toString(),
			},
		});
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
				err: "Failed to start quest.",
			};
		}
	}
}

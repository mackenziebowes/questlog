import { cwd } from "node:process";
import type { HelperResponse, LoadedQuest } from "../types";
import { QuestStepStatus } from "../types";
import fs from "node:fs";

export async function startQuest(
	loadedQuests: Map<number, LoadedQuest>
): Promise<HelperResponse> {
	try {
		const loc = cwd() + "/quest.toml";

		return {
			ok: true,
			data: "",
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

function findNextStep(quests: Map<number, LoadedQuest>) {
	const questCount = quests.size;
	for (let i = 1; i <= questCount; i++) {
		const quest = quests.get(i);
		if (quest && quest.status === QuestStepStatus.PENDING) {
			return quest;
		}
	}
	return null;
}

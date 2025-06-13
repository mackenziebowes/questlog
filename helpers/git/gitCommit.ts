import type { HelperResponse } from "../types";
import { sanitizeQuestName } from "./sanitizeQuestName";

export async function gitCommit(questName: string): Promise<HelperResponse> {
	let qn = sanitizeQuestName(questName);
	const statusOutput = await Bun.$`git status --porcelain`;
	if (statusOutput.stdout.toString().trim()) {
		try {
			await Bun.$`git add .`;
			await Bun.$`git commit -m "[CTQL]: Finished Quest '${questName}'"`;
		} catch (err) {
			if (err instanceof Error) {
				return {
					ok: false,
					err: err.message,
				};
			} else {
				return {
					ok: false,
					err: "You have uncommitted changes. Please commit or stash them before switching branches.",
				};
			}
		}
	}
	return {
		ok: true,
		data: "",
	};
}

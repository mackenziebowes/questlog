import type { HelperResponse } from "../types";
import { sanitizeQuestName } from "./sanitizeQuestName";
export async function gitCheckout(questName: string): Promise<HelperResponse> {
	let qn = sanitizeQuestName(questName);
	const statusOutput = await Bun.$`git status --porcelain`;
	if (statusOutput.stdout.toString().trim()) {
		// There are uncommitted changes
		try {
			await Bun.$`git add .`;
			await Bun.$`git commit -m "[CTQL]: Committing before Embarking on '${questName}'"`;
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
	await Bun.$`git checkout ${qn}`;
	return {
		ok: true,
		data: {
			msg: `[🏕️ Checked Out Quest!] ${questName}`,
		},
	};
}

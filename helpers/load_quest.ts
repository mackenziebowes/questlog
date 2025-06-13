import fs from "node:fs";
import { cwd } from "node:process";
import type { HelperResponse, DeclaredQuest, LoadedQuest } from "./types";
import { QuestStepStatus } from "./types";
import { parse, stringify, TomlDate } from "smol-toml";

export function loadQuest(): HelperResponse {
	try {
		// -- Relative Path -------------------
		const questLocation = cwd() + "/quest.toml";
		// -- Quest Guard ---------------------
		if (!fs.existsSync(questLocation)) {
			throw new Error(
				"❌ quest.toml not found in the current directory. Please ensure it exists to proceed. 📝"
			);
		}
		// -- Load Quest To Memory ------------
		const questTOML = fs.readFileSync(`${cwd()}/quest.toml`, "utf8");
		// -- Quests Must Follow Spec ---------
		const loadedQuests: Map<number, LoadedQuest> = new Map();
		const tix = questTOML.split("[[ticket]]");
		if (tix.length == 0) {
			throw new Error(
				"❌ Unable to parse quest.toml - No tickets set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
			);
		}
		// -- Load into Memory -----------------
		for (const ticket of tix) {
			const {
				id,
				name,
				description,
				points,
				timeStarted,
				timeFinished,
				status,
			} = parse(ticket);
			if (!id || typeof id !== "number") {
				throw new Error(
					"❌ Unable to parse quest.toml. At least one ticket doesn't have an id set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
				);
			}
			if (!name || typeof name !== "string") {
				throw new Error(
					"❌ Unable to parse quest.toml. At least one ticket doesn't have a name set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
				);
			}
			if (!description || typeof description !== "string") {
				throw new Error(
					"❌ Unable to parse quest.toml. At least one ticket doesn't have a description set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
				);
			}
			if (!points || typeof points !== "number") {
				throw new Error(
					"❌ Unable to parse quest.toml. At least one ticket doesn't have points set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
				);
			}
			let thisStatus = (status as QuestStepStatus) || QuestStepStatus.PENDING;
			let tts = (timeStarted as TomlDate) || undefined;
			let ttf = (timeFinished as TomlDate) || undefined;
			let newLoadedQuest = {
				id,
				name,
				description,
				points,
				timeStarted: tts,
				timeFinished: ttf,
				status: thisStatus,
			};
			loadedQuests.set(id, newLoadedQuest);
		}
		// -- Reformat quest.toml ----------
		let allLoadedQuests = loadedQuests.entries();
		let reformattedQuests = Array.from(allLoadedQuests).map(([id, quest]) => ({
			ticket: quest,
		}));
		reformattedQuests.sort((a, b) => a.ticket.id - b.ticket.id);
		loadedQuests.clear();
		for (const { ticket } of reformattedQuests) {
			loadedQuests.set(ticket.id, {
				id: ticket.id,
				name: ticket.name,
				description: ticket.description,
				points: ticket.points,
				timeStarted: ticket.timeStarted,
				timeFinished: ticket.timeFinished,
				status: ticket.status,
			});
		}
		const reformattedTOML = stringify({ reformattedQuests });
		fs.writeFileSync(questLocation, reformattedTOML, "utf8");
		return {
			ok: true,
			data: loadedQuests,
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

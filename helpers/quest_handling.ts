import fs from "node:fs";
import { cwd } from "node:process";
import type { HelperResponse, LoadedQuest, LoadedQuests } from "./types";
import { QuestStepStatus } from "./types";
import { parse, stringify, TomlDate } from "smol-toml";
import TOML from "smol-toml";
import { state, StateOptions } from "./state";

const quests = new Map<number, LoadedQuest>();

function loadQuest(): HelperResponse {
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
		const parsed = TOML.parse(questTOML);

		const tix = parsed.ticket;
		if (!tix || !Array.isArray(tix)) {
			throw new Error(
				"❌ Unable to parse quest.toml - No tickets set. See https://github.com/mackenziebowes/questlog/guides/QuestSpec.md"
			);
		}
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
			} = ticket as {
				id: number;
				name: string;
				description: string;
				points: number;
				timeStarted?: TomlDate;
				timeFinished?: TomlDate;
				status?: QuestStepStatus;
			};
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
			quests.set(id, newLoadedQuest);
		}
		const hasFormattedQuests = state.get(StateOptions.FormattedQuests) as
			| boolean
			| undefined;
		if (!hasFormattedQuests) {
			// -- Reformat quest.toml ----------
			let allLoadedQuests = quests.entries();
			let reformattedQuests = Array.from(allLoadedQuests).map(
				([id, quest]) => ({
					ticket: quest,
				})
			);
			reformattedQuests.sort((a, b) => a.ticket.id - b.ticket.id);
			for (const { ticket } of reformattedQuests) {
				quests.set(ticket.id, {
					id: ticket.id,
					name: ticket.name,
					description: ticket.description,
					points: ticket.points,
					timeStarted: ticket.timeStarted,
					timeFinished: ticket.timeFinished,
					status: ticket.status,
				});
			}
			const reformattedTOML = stringify({
				ticket: reformattedQuests.map(({ ticket }) => ticket),
			});
			fs.writeFileSync(questLocation, reformattedTOML, "utf8");
			state.set(StateOptions.FormattedQuests, true);
		}
		return {
			ok: true,
			data: quests,
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

function saveQuest(): HelperResponse {
	try {
		// -- Relative Path -------------------
		const loc = cwd() + "/quest.toml";
		// -- Quest Guard ---------------------
		if (!fs.existsSync(loc) && !fs.statSync(loc).isFile()) {
			throw new Error(
				"❌ quest.toml not found in the current directory. Please ensure it exists to proceed. 📝"
			);
		}
		// -- Save ------------
		let allLoadedQuests = Array.from(quests.entries());
		// const questObj = Object.fromEntries(quests.entries());
		const tomlString = stringify({
			ticket: allLoadedQuests.map(([_, quest]) => quest),
		});
		const questContents = `${tomlString}`;
		fs.writeFileSync(loc, questContents, "utf8");
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
				err: "Failed to save quest progress.",
			};
		}
	}
}

function findFirstStep(quests: LoadedQuests) {
	const questCount = quests.size;
	for (let i = 1; i <= questCount; i++) {
		const quest = quests.get(i);
		if (quest && quest.status === QuestStepStatus.PENDING) {
			return quest;
		}
	}
	return null;
}

const quest = {
	load: loadQuest,
	save: saveQuest,
	first: findFirstStep,
	quests,
};

export default quest;

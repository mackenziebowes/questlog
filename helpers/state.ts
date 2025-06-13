import fs from "node:fs";
import TOML from "smol-toml";
import type { CTQLState, HelperResponse, Primitive } from "./types";
import { cwd } from "node:process";

export enum StateOptions {
	FormattedQuests = "FormattedQuests",
	CurrentQuestId = "currentQuestId",
	TimeElapsed = "timeElapsed",
	AutoGit = "autogit",
	NumQuestsFinished = "numQuestsFinished",
	NumQuests = "numQuests",
}

export const state: CTQLState = new Map<StateOptions, Primitive>();

export function loadState(): HelperResponse {
	try {
		// -- Look for local state ------
		let state_loc = cwd() + "/ctql-state.toml";
		if (!fs.existsSync(state_loc)) {
			// -- Initialize ------------
			fs.writeFileSync(state_loc, StateTomlInit, "utf8");
			return {
				ok: true,
				data: "",
			};
		}
		// -- Try To Load ---------------
		const existingState = TOML.parse(fs.readFileSync(state_loc, "utf8"));
		if (Object.entries(existingState).length == 0) {
			// -- Re-initialize empty state --------
			fs.writeFileSync(state_loc, StateTomlInit, "utf8");
			return {
				ok: true,
				data: "",
			};
		}
		Object.entries(existingState).map(([key, value]) => {
			state.set(key, value);
		});
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
				err: "Failed to load quest.",
			};
		}
	}
}

const StateTomlInit = `
# Auto Generated - Do Not Edit
# CTQL State File
` as const;

export function saveState(): HelperResponse {
	try {
		let state_loc = cwd() + "/ctql-state.toml";
		if (!fs.existsSync(state_loc)) {
			// -- Initialize ------------
			fs.writeFileSync(state_loc, StateTomlInit, "utf8");
			return {
				ok: true,
				data: "",
			};
		}
		// -- Save ------------
		const stateObject = Object.fromEntries(state.entries());
		const tomlString = TOML.stringify(stateObject);
		const stateContents = `${StateTomlInit}\n${tomlString}`;
		fs.writeFileSync(state_loc, stateContents, "utf8");
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
				err: "Failed to load quest.",
			};
		}
	}
}

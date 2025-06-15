import fs from "node:fs";
import TOML from "smol-toml";
import type { CTQLState, HelperResponse, Primitive } from "./types";
import { cwd } from "node:process";
import readline from "node:readline";

export enum StateOptions {
	FormattedQuests = "FormattedQuests",
	CurrentQuestId = "currentQuestId",
	TimeElapsed = "timeElapsed",
	AutoGit = "autogit",
	NumQuestsFinished = "numQuestsFinished",
	NumQuests = "numQuests",
	CommitQuests = "CommitQuests",
	FigletTitle = "figletTitle",
	FigletSubtitle = "figletSubtitle",
	Schedule = "schedule",
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

[schedule]
mode = "default"      # “default”, “deep” or “rapid”
lastNotifiedBlock = ""  
` as const;

type saveStateArgs = {
	updates?: Partial<Record<StateOptions, Primitive>>;
	all?: boolean;
};

export async function saveState(args?: saveStateArgs): Promise<HelperResponse> {
	try {
		let statePath = cwd() + "/ctql-state.toml";
		let saveAll = args?.all;
		if (saveAll) {
			let base: Record<string, any> = {};
			if (fs.existsSync(statePath)) {
				const raw = fs.readFileSync(statePath, "utf8");
				base = TOML.parse(raw) as Record<string, any>;
			} else {
				fs.writeFileSync(statePath, StateTomlInit, "utf8");
				base = TOML.parse(StateTomlInit) as Record<string, any>;
			}
			// merge in updates
			const merged = args
				? deepMerge(base, args.updates as Record<string, any>)
				: base;
			// stringify and atomic write
			const tomlString = TOML.stringify(merged);
			const full = `${StateTomlInit}\n${tomlString}`;

			const tmp = statePath + ".tmp";
			fs.writeFileSync(tmp, full, "utf8");
			fs.renameSync(tmp, statePath);

			return { ok: true, data: "" };
		} else {
			if (!fs.existsSync(statePath)) {
				// -- Initialize ------------
				fs.writeFileSync(statePath, StateTomlInit, "utf8");
				return {
					ok: true,
					data: "",
				};
			}
			const stateObject = Object.fromEntries(state.entries());
			const tomlString = TOML.stringify(stateObject);
			const stateContents = `${StateTomlInit}\n${tomlString}`;
			fs.writeFileSync(statePath, stateContents, "utf8");
			return {
				ok: true,
				data: "",
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

export function deepMerge<T extends Record<string, any>>(
	target: T,
	updates: Partial<T>
): T {
	const output = { ...target };
	for (const key of Object.keys(updates)) {
		const updVal = updates[key] as any;
		const tgtVal = (target as any)[key];
		if (
			typeof tgtVal === "object" &&
			tgtVal !== null &&
			typeof updVal === "object" &&
			updVal !== null &&
			!Array.isArray(tgtVal) &&
			!Array.isArray(updVal)
		) {
			// both are non-array objects → recurse
			(output as any)[key] = deepMerge(tgtVal, updVal);
		} else {
			// otherwise, overwrite
			(output as any)[key] = updVal;
		}
	}
	return output;
}

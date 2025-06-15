import { state, loadState, saveState, StateOptions } from "../state";
import blocks, { type Block } from "./blocks";
import { syncWithSystemClock } from "./alerts";
import type { TomlPrimitive } from "smol-toml";
import { exitMsg } from "../decorators/exit_msg";
import { notify } from "./notify";

export async function run() {
	loadState();
	const schedule = validateSchedule();
	const scheduleDef = blocks.def[schedule.mode];
	syncWithSystemClock(async () => {
		const nowBlock = blocks.current(scheduleDef);
		if (nowBlock.label !== schedule.lastNotifiedBlock?.label) {
			// 3) we’ve entered a new slice
			await notify(
				nowBlock.label,
				`Time for ${nowBlock.label} (${nowBlock.end - nowBlock.start}m)`
			);
			schedule.lastNotifiedBlock = {
				label: nowBlock.label,
				mins: nowBlock.end - nowBlock.start,
			};
			state.set(StateOptions.Schedule, schedule);
			saveState({ all: true });
		}
		process.stdin.resume();
	});
}

type ModeOptions = "deep" | "default" | "rapid";

type Schedule = {
	mode: ModeOptions;
	lastNotifiedBlock?: Block;
};

function validateSchedule(): Schedule {
	const schedule =
		(state.get("schedule") as { [key: string]: TomlPrimitive }) || undefined;
	if (!schedule) {
		exitMsg("Could not find Schedule in State");
	}
	if (!Object.keys(schedule).includes("mode")) {
		exitMsg("Schedule malformed in state \n run `ctql schedule` to repair");
	}
	const mode = (schedule.mode as ModeOptions) || undefined;
	if (!mode) {
		exitMsg("Schedule malformed in state \n run `ctql schedule` to repair");
	}
	if (Object.keys(schedule).includes("lastNotifiedBlock")) {
		const lastNotifiedBlock =
			(schedule.lastNotifiedBlock as Block) || undefined;
		if (lastNotifiedBlock) {
			return { mode, lastNotifiedBlock };
		}
	}
	return { mode };
}

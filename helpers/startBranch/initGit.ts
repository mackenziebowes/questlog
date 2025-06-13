import { cwd } from "node:process";
import type { HelperResponse } from "../types";
import fs from "node:fs";

export async function initGit(): Promise<HelperResponse> {
	try {
		const loc = cwd() + "/quest.toml";
		await Bun.$`git init`.cwd(loc);
		if (fs.existsSync(loc)) {
			let current = fs.readFileSync(loc + ".gitignore", "utf8");
			current += gitIgnorePayload;
			fs.writeFileSync(loc + ".gitignore", current, "utf8");
		} else {
			fs.writeFileSync(loc + ".gitignore", gitIgnorePayload, "utf8");
		}
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

const gitIgnorePayload = `# Questlog
quest.toml` as const;

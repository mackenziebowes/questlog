import { cwd } from "node:process";
import type { HelperResponse } from "../types";
import fs from "node:fs";
import { state, StateOptions } from "../state";

export async function gitInit(): Promise<HelperResponse> {
	try {
		// Ensure the .git directory exists
		const git_loc = cwd() + "/.git";
		if (!fs.existsSync(git_loc)) {
			await Bun.$`git init`.cwd(cwd());
		}

		const commitQuests =
			(state.get(StateOptions.CommitQuests) as boolean | undefined) || false;
		if (!commitQuests) {
			// Ensure .gitignore exists and includes quest.toml
			const git_ig_loc = cwd() + "/.gitignore";
			let current = "";

			// If .gitignore exists and is a file, read its content
			if (fs.existsSync(git_ig_loc) && fs.statSync(git_ig_loc).isFile()) {
				current = fs.readFileSync(git_ig_loc, "utf8");
			}

			// Add quest.toml to .gitignore if it's not already included
			if (!current.includes("quest.toml")) {
				current +=
					(current.endsWith("\n") ? "" : "\n") + gitIgnorePayload + "\n";
			}

			// Write the updated content back to .gitignore
			fs.writeFileSync(git_ig_loc, current, "utf8");
		}
		if (commitQuests) {
			const git_ig_loc = cwd() + "/.gitignore";
			let current = "";

			// If .gitignore exists and is a file, read its content
			if (fs.existsSync(git_ig_loc) && fs.statSync(git_ig_loc).isFile()) {
				current = fs.readFileSync(git_ig_loc, "utf8");
			}

			// Add quest.toml to .gitignore if it's not already included
			if (
				current.includes("quest.toml") ||
				current.includes("ctql-state.toml")
			) {
				current = current
					.split("\n")
					.filter(
						(line) =>
							!line.includes("quest.toml") && !line.includes("ctql-state.toml")
					)
					.join("\n");
			}

			// Write the updated content back to .gitignore
			fs.writeFileSync(git_ig_loc, current, "utf8");
		}
		return {
			ok: true,
			data: "✨ Git Initialized!",
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
				err: "❌ Failed to initialize quest.",
			};
		}
	}
}

const gitIgnorePayload = `# Questlog
quest.toml
ctql-state.toml` as const;

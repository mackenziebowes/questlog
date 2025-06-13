#!/usr/bin/env bun

import * as p from "@clack/prompts";
import { gitGuard } from "./helpers/git_guard";
import { loadQuest } from "./helpers/load_quest";
import start from "./helpers/startBranch";

async function main() {
	p.intro("⚔️ Quest Log 🏰");
	const action = await p.group(
		{
			action: ({ results }) =>
				p.select({
					options: [
						{
							value: "start",
							label: "Start a Quest Line",
							hint: "Needs a ./quest.toml nearby",
						},
						{
							value: "done",
							label: "Progress a Quest Line",
							hint: "Needs an in-progress questline",
						},
						{
							value: "stats",
							label: "See Stats",
							hint: "Needs an in-progress questline",
						},
					],
					message: "What would you like to do?",
				}),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		}
	);

	// -- Start Branch ----------
	if (action == "start") {
		const autogit = await p.group(
			{
				autogit: ({ results }) =>
					p.confirm({ message: "Sync progress with git?" }),
			},
			{
				onCancel: () => {
					p.cancel("Operation cancelled.");
					process.exit(0);
				},
			}
		);

		const loadQuestRes = loadQuest();
		if (!loadQuestRes.ok) {
			p.cancel(loadQuestRes.err);
			process.exit(0);
		}

		if (autogit) {
			const gitGuardRes = gitGuard();
			if (!gitGuardRes.ok) {
				p.cancel(gitGuardRes.err);
				process.exit(0);
			}
			const gitInitRes = await start.initGit();
			if (!gitInitRes.ok) {
				p.cancel(gitInitRes.err);
				process.exit(0);
			}
		}
	}

	// -- Done Branch ----------
	if (action == "done") {
	}

	// -- Stats Branch -----------
	if (action == "stats") {
	}

	p.outro("🦅 Safe Travels! 🏕️");
}

main();

#!/usr/bin/env bun

import * as p from "@clack/prompts";
import quest from "./helpers/quest_handling";
import { state, loadState, saveState, StateOptions } from "./helpers/state";
import git from "./helpers/git";
import start from "./helpers/start";
import done from "./helpers/done";
import { displayStats } from "./helpers/stats";

async function main() {
	p.intro("⚔️  Quest Log 🏰");
	const loadStateRes = loadState();
	if (!loadStateRes.ok) {
		p.cancel(loadStateRes.err);
		process.exit(0);
	}
	const { action } = await p.group(
		{
			action: () =>
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
						{
							value: "manage_git",
							label: "Manage Git",
							hint: "Manage your git settings",
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
		p.log.step("🧙‍♂️ Starting your quest line...");
		const { autogit } = await p.group(
			{
				autogit: () =>
					p.confirm({ message: "🤔 Auto-sync progress with git?" }),
			},
			{
				onCancel: () => {
					p.cancel("Operation cancelled.");
					process.exit(0);
				},
			}
		);
		// -- Save git toggle for future ----
		state.set(StateOptions.AutoGit, autogit);
		saveState();
		p.log.step("Loading...");
		const loadQuestRes = quest.load();
		if (!loadQuestRes.ok) {
			p.cancel(loadQuestRes.err);
			process.exit(0);
		}
		const quests = loadQuestRes.data;
		if (autogit) {
			p.log.step("Configuring git...");
			const gitGuardRes = git.guard();
			if (!gitGuardRes.ok) {
				p.cancel(gitGuardRes.err);
				process.exit(0);
			}
			const gitInitRes = await git.init();
			if (!gitInitRes.ok) {
				p.cancel(gitInitRes.err);
				process.exit(0);
			}
		}
		p.log.step("Taking first step...");
		const startQuestRes = start.quest(quests);
		if (!startQuestRes.ok) {
			p.cancel(startQuestRes.err);
			process.exit(0);
		}
		p.log.success(startQuestRes.data.msg);
		if (autogit) {
			const gitCheckoutRes = await git.checkout(startQuestRes.data.questName);
			if (!gitCheckoutRes.ok) {
				p.cancel(gitCheckoutRes.err);
				process.exit(0);
			}
			p.log.success(gitCheckoutRes.data.msg);
		}
		// -- Quietly Save Data ---------------
		quest.save();
		saveState();
		p.outro("🦅 Safe Travels! 🏕️");
	}

	// -- Done Branch ----------
	if (action == "done") {
		quest.load();
		const finishResponse = await done.finish();
		if (!finishResponse.ok) {
			p.cancel(finishResponse.err);
			process.exit(0);
		}
		quest.save();
		saveState();
		p.outro("🦅 Ever Onwards! 🏕️");
	}

	// -- Stats Branch -----------
	if (action == "stats") {
		quest.load();
		const statsRes = displayStats();
		if (statsRes.ok) {
			p.log.info(statsRes.data);
		} else {
			p.log.warn(statsRes.data);
		}
		p.outro("🦅 Keep Going! 🏕️");
	}

	if (action == "manage_git") {
		const gitGuardRes = git.guard();
		if (!gitGuardRes.ok) {
			p.cancel(gitGuardRes.err);
			process.exit(0);
		}
		const { autogit } = await p.group(
			{
				autogit: () =>
					p.confirm({ message: "🤔 Auto-sync progress with git?" }),
			},
			{
				onCancel: () => {
					p.cancel("Operation cancelled.");
					process.exit(0);
				},
			}
		);
		// -- Save git toggle for future ----
		state.set(StateOptions.AutoGit, autogit);
		if (autogit) {
			const gitInitRes = await git.init();
			if (!gitInitRes.ok) {
				p.cancel(gitInitRes.err);
				process.exit(0);
			}
		}
		saveState();
		p.outro("🦅 Git Updated! 🏕️");
	}
}

const subcommand = Bun.argv[2];

if (!subcommand) {
	main();
} else {
	const loadStateRes = loadState();
	if (!loadStateRes.ok) {
		p.cancel(loadStateRes.err);
		process.exit(0);
	}
	switch (subcommand) {
		case "done":
			p.intro("⚔️  Quest Log - Step Complete 🏰");
			quest.load();
			const finishResponse = await done.finish();
			if (!finishResponse.ok) {
				p.cancel(finishResponse.err);
				process.exit(0);
			}
			quest.save();
			saveState();
			p.outro("🦅 Ever Onwards! 🏕️");
			break;
		case "stats":
			p.intro("⚔️  Quest Log - Stats 🏰");
			quest.load();
			const statsRes = displayStats();
			if (statsRes.ok) {
				p.log.info(statsRes.data);
			} else {
				p.log.warn(statsRes.data);
			}
			p.outro("🦅 Keep Going! 🏕️");
			break;
		case "git":
			p.intro("⚔️  Quest Log - Git 🏰");
			const gitGuardRes = git.guard();
			if (!gitGuardRes.ok) {
				p.cancel(gitGuardRes.err);
				process.exit(0);
			}
			const { autogit } = await p.group(
				{
					autogit: () =>
						p.confirm({ message: "🤔 Auto-sync progress with git?" }),
				},
				{
					onCancel: () => {
						p.cancel("Operation cancelled.");
						process.exit(0);
					},
				}
			);
			// -- Save git toggle for future ----
			state.set(StateOptions.AutoGit, autogit);
			if (autogit) {
				const gitInitRes = await git.init();
				if (!gitInitRes.ok) {
					p.cancel(gitInitRes.err);
					process.exit(0);
				}
			}
			saveState();
			p.outro("🦅 Git Updated! 🏕️");
			break;
		default:
			break;
	}
}

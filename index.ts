#!/usr/bin/env bun

import * as p from "@clack/prompts";
import quest from "./helpers/quest_handling";
import { state, loadState, saveState, StateOptions } from "./helpers/state";
import git from "./helpers/git";
import start from "./helpers/start";
import done from "./helpers/done";
import render, { displayStats, renderStats } from "./helpers/stats";
import { syncWithSystemClock } from "./helpers/schedule/alerts";
import fig from "./helpers/decorators/figlet";
import { exitMsg } from "./helpers/decorators/exit_msg";
import readline from "node:readline";

async function main() {
	fig.title.p("CTQL");
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
		fig.subtitle.p("start");
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
		await saveState({ updates: { autogit } });
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
			const gitCheckoutRes = await git.checkout(startQuestRes.data.name);
			if (!gitCheckoutRes.ok) {
				p.cancel(gitCheckoutRes.err);
				process.exit(0);
			}
			p.log.success(gitCheckoutRes.data.msg);
		}
		// -- Quietly Save Data ---------------
		quest.save();
		saveState({ all: true });
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
		saveState({ all: true });
		p.outro("🦅 Ever Onwards! 🏕️");
	}

	// -- Stats Branch -----------
	if (action == "stats") {
		fig.subtitle.p("stats");
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
		fig.subtitle.p("git");
		const gitGuardRes = git.guard();
		if (!gitGuardRes.ok) {
			p.cancel(gitGuardRes.err);
			process.exit(0);
		}
		const { autogit, commitQuests } = await p.group(
			{
				autogit: () =>
					p.confirm({ message: "🔗 Auto-sync progress with git?" }),
				commitQuests: () => p.confirm({ message: "📝 Commit your quest log?" }),
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
		state.set(StateOptions.CommitQuests, commitQuests);
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

async function handleDone() {
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
	await Bun.$`bunx ctql stats`;
	return;
}

if (!subcommand) {
	main();
} else {
	async function sub() {
		readline.emitKeypressEvents(process.stdin);
		if (process.stdin.isTTY) process.stdin.setRawMode(true);
		fig.title.p("CTQL");
		const loadStateRes = loadState();
		if (!loadStateRes.ok) {
			exitMsg(loadStateRes.err);
		}
		process.stdin.on(
			"keypress",
			async (
				str: string,
				key: { name: string; ctrl: boolean; shift: boolean }
			) => {
				// Example combos:
				// Ctrl-D:
				if (key.name === "d") {
					render.pause();
					await handleDone(); // mark current task done
					// re-render immediately
					render.do();
					render.resume();
				}
				if (key.name === "q") {
					exitMsg("User Quit Process");
				}
			}
		);
		console.clear();
		process.on("SIGINT", () => {
			exitMsg("");
		});
		switch (subcommand) {
			case "done": {
				handleDone();
				return;
			}
			case "stats":
				{
					render.do();
					render.start();
				}
				break;
			case "git":
				fig.subtitle.p("git");
				p.intro("⚔️  Quest Log - Git 🏰");
				const gitGuardRes = git.guard();
				if (!gitGuardRes.ok) {
					p.cancel(gitGuardRes.err);
					process.exit(0);
				}
				const { autogit, commitQuests } = await p.group(
					{
						autogit: () =>
							p.confirm({ message: "🔗 Auto-sync progress with git?" }),
						commitQuests: () =>
							p.confirm({ message: "📝 Commit your quest log?" }),
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
				state.set(StateOptions.CommitQuests, commitQuests);
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
	sub();
}

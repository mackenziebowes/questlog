#!/usr/bin/env bun

import * as p from "@clack/prompts";
import quest from "./helpers/quest_handling";
import { state, loadState, saveState, StateOptions } from "./helpers/state";
import git from "./helpers/git";
import start from "./helpers/start";
import done from "./helpers/done";
import render, { displayStats, renderStats } from "./helpers/stats";
import { syncWithSystemClock } from "./helpers/schedule/alerts";
import fig, {
	type SubTitleFonts,
	type TitleFonts,
} from "./helpers/decorators/figlet";
import { exitMsg } from "./helpers/decorators/exit_msg";
import readline from "node:readline";
import fs from "node:fs";
import { cwd } from "node:process";
import { QuestStepStatus } from "./helpers/types";

// UI Screens enum for tracking current view
enum Screen {
	HOME = "home",
	STATS = "stats",
	OPTIONS = "options",
	GIT = "git",
	HEALTH = "health",
	DECORATE = "decorate",
	START = "start",
}

// Main keystroke-based UI controller
class KeystrokeUI {
	currentScreen: Screen = Screen.HOME;
	intervalId: NodeJS.Timeout | null = null;
	isPaused: boolean = false;
	lastAction: () => void = () => {};

	constructor() {
		this.setupKeyListeners();
		process.on("SIGINT", () => {
			this.cleanupAndExit();
		});
	}

	setupKeyListeners() {
		readline.emitKeypressEvents(process.stdin);
		if (process.stdin.isTTY) process.stdin.setRawMode(true);

		process.stdin.on(
			"keypress",
			async (
				str: string,
				key: { name: string; ctrl: boolean; shift: boolean }
			) => {
				// Global key handlers
				if (key.name === "q") {
					this.cleanupAndExit();
				}

				// Screen-specific handlers
				switch (this.currentScreen) {
					case Screen.HOME:
					case Screen.STATS:
						await this.handleHomeKeys(key.name);
						break;
					case Screen.OPTIONS:
						await this.handleOptionsKeys(key.name);
						break;
					case Screen.GIT:
						await this.handleGitKeys(key.name);
						break;
					case Screen.HEALTH:
						await this.handleHealthKeys(key.name);
						break;
					case Screen.DECORATE:
						await this.handleDecorateKeys(key.name);
						break;
					case Screen.START:
						await this.handleStartKeys(key.name);
						break;
				}
			}
		);
	}

	async handleHomeKeys(key: string) {
		switch (key) {
			case "d":
				this.pauseRendering();
				await this.handleDone();
				this.resumeRendering();
				break;
			case "s":
				if (!this.isQuestlineInitialized()) {
					this.navigateTo(Screen.START);
				}
				break;
			case "o":
				if (this.isQuestlineInitialized()) {
					this.navigateTo(Screen.OPTIONS);
				}
				break;
		}
	}

	async handleOptionsKeys(key: string) {
		switch (key) {
			case "g":
				this.navigateTo(Screen.GIT);
				break;
			case "h":
				if (this.isQuestlineInitialized()) {
					this.navigateTo(Screen.HEALTH);
				}
				break;
			case "d":
				if (this.isQuestlineInitialized()) {
					this.navigateTo(Screen.DECORATE);
				}
				break;
			case "b":
				this.navigateTo(Screen.HOME);
				break;
		}
	}

	async handleGitKeys(key: string) {
		if (key === "b") {
			this.navigateTo(Screen.OPTIONS);
		}
	}

	async handleHealthKeys(key: string) {
		if (key === "b") {
			this.navigateTo(Screen.OPTIONS);
		}
	}

	async handleDecorateKeys(key: string) {
		if (key === "b") {
			this.navigateTo(Screen.OPTIONS);
		}
	}

	async handleStartKeys(key: string) {
		if (key === "b") {
			this.navigateTo(Screen.HOME);
		}
	}

	async navigateTo(screen: Screen) {
		console.log({ currentScreen: this.currentScreen });
		this.pauseRendering();
		this.currentScreen = screen;
		console.log({ currentScreen: this.currentScreen });
		console.clear();
		fig.title.p("CTQL");
		switch (screen) {
			// static/animated screens (need rerenders)
			case Screen.HOME:
			case Screen.STATS:
				console.log({ loc: "home | stats" });
				if (this.isQuestlineInitialized()) {
					quest.load(); // load before loop
					this.renderHomeScreen();
					this.startRendering();
				} else {
					this.renderWelcomeScreen();
					this.navigateTo(Screen.HOME);
				}
				break;
			case Screen.OPTIONS:
				console.log({ loc: "Options" });
				await this.renderOptionsScreen();
				this.startRendering();
				break;
			// interactive/dynamic screens (no rerenders)
			case Screen.GIT:
				console.log({ loc: "git" });
				await this.renderGitScreen();
				break;
			case Screen.HEALTH:
				console.log({ loc: "health" });
				await this.renderHealthScreen();
				break;
			case Screen.DECORATE:
				console.log({ loc: "decorate" });
				await this.renderDecorateScreen();
				break;
			case Screen.START:
				console.log({ loc: "start" });
				await this.renderStartScreen();
				this.navigateTo(Screen.HOME);
				break;
		}
	}

	async renderCurrentScreen() {
		switch (this.currentScreen) {
			// Screens Without Forms (need continuous rerendering)
			case Screen.HOME:
			case Screen.STATS:
				await this.renderHomeScreen();
				this.resumeRendering();
				break;
			case Screen.OPTIONS:
				await this.renderOptionsScreen();
				this.resumeRendering();
				break;

			// Screens with forms (can't have rerendering)
			// case Screen.DECORATE:
			// 	await this.renderDecorateScreen();
			// 	break;
			// case Screen.GIT:
			// 	await this.renderGitScreen();
			// 	break;
			// case Screen.HEALTH:
			// 	await this.renderHealthScreen();
			// 	break;
			// case Screen.START:
			// 	await this.renderStartScreen();
			// 	break;
		}
	}

	async renderHomeScreen() {
		fig.title.p("CTQL");
		fig.subtitle.p("Stats");
		this.lastAction();
		const statsRes = displayStats();
		if (statsRes.ok) {
			p.log.info(statsRes.data);
			console.log("\nKeys: [d]one | [o]ptions | [q]uit");
		} else {
			p.log.warn(statsRes.data);
			console.log("\nKeys: [s]tart | [q]uit");
		}
	}

	async renderWelcomeScreen() {
		fig.subtitle.p("Welcome");
		this.lastAction();
		p.log.info("\n🏰 Welcome to CTQL - Quest Log!\n");
		p.log.info("No active questline found. Create one to get started.");
		console.log("\nKeys: [s]tart | [q]uit");
	}

	async renderOptionsScreen() {
		fig.title.p("CTQL");
		fig.subtitle.p("Options");
		this.lastAction();
		p.log.info("\n⚙️ Options\n");
		console.log("[g]it - Configure Git integration");
		console.log("[h]ealth - Configure health schedule");
		console.log("[d]ecorate - Customize UI fonts");
		console.log("\nKeys: [g/h/d] select option | [b]ack | [q]uit");
	}

	async renderGitScreen() {
		fig.subtitle.p("git");
		this.lastAction();
		const gitGuardRes = git.guard();
		if (!gitGuardRes.ok) {
			this.lastAction = () => p.log.error(gitGuardRes.err);
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		}

		try {
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
						// Return values don't matter, we'll return to the options screen
						return {
							autogit: state.get(StateOptions.AutoGit) as boolean,
							commitQuests: state.get(StateOptions.CommitQuests) as boolean,
						};
					},
				}
			);

			// Only save state if we got this far (user didn't cancel)
			state.set(StateOptions.AutoGit, autogit);
			state.set(StateOptions.CommitQuests, commitQuests);

			if (autogit) {
				const gitInitRes = await git.init();
				if (!gitInitRes.ok) {
					this.lastAction = () => p.log.error(gitInitRes.err);
					await this.navigateTo(Screen.OPTIONS);
					this.resumeRendering();
					return;
				}
			}

			saveState({
				updates: {
					[StateOptions.AutoGit]: autogit,
					[StateOptions.CommitQuests]: commitQuests,
				},
			});

			this.lastAction = () => p.log.success("Git settings updated!");
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		} catch (err) {
			// If there's any error, go back to options screen
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		}
	}

	async renderHealthScreen() {
		fig.subtitle.p("health");
		p.log.info("\n🧘 Health Schedule Configuration\n");
		try {
			const { useHealthSchedule, scheduleType } = await p.group(
				{
					useHealthSchedule: () =>
						p.confirm({
							message: "Use a health schedule?",
							initialValue: state.get(StateOptions.Schedule) !== undefined,
						}),
					scheduleType: ({ results }) => {
						if (results.useHealthSchedule) {
							return p.select({
								message: "Select schedule type:",
								initialValue:
									(state.get(StateOptions.Schedule) as string) || "default",
								options: [
									{
										value: "deep",
										label: "Deep Work",
										hint: "Longer focus periods",
									},
									{
										value: "default",
										label: "Default",
										hint: "Balanced approach",
									},
									{ value: "rapid", label: "Rapid", hint: "Frequent breaks" },
								],
							});
						}
					},
				},
				{
					onCancel: () => {
						p.cancel("Operation cancelled.");
						return {
							useHealthSchedule: state.get(StateOptions.Schedule) !== undefined,
							scheduleType: state.get(StateOptions.Schedule) as string,
						};
					},
				}
			);

			const castScheduleSelection = scheduleType as
				| "deep"
				| "default"
				| "rapid";
			const scheduleDec = {
				mode: castScheduleSelection,
			};
			if (useHealthSchedule && scheduleType) {
				state.set(StateOptions.Schedule, scheduleDec);
				saveState({
					updates: {
						[StateOptions.Schedule]: scheduleDec,
					},
				});
				this.lastAction = () => p.log.success("Health schedule updated!");
			} else if (!useHealthSchedule) {
				state.set(StateOptions.Schedule, "");
				saveState({
					updates: {
						[StateOptions.Schedule]: undefined,
					},
				});
				this.lastAction = () => p.log.success("Health schedule disabled!");
			}
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		} catch (err) {
			// If there's any error, go back to options screen
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		}
	}

	async renderDecorateScreen() {
		fig.subtitle.p("UI");
		p.log.info("\n🎨 UI Customization\n");
		try {
			const { changeTitle, titleFont, changeSubtitle, subtitleFont } =
				await p.group(
					{
						changeTitle: () =>
							p.confirm({
								message: "Change title font?",
								initialValue: true,
							}),
						titleFont: ({ results }) => {
							if (results.changeTitle) {
								return p.select({
									message: "Select title font:",
									initialValue:
										(state.get(StateOptions.FigletTitle) as string) ||
										fig.title.l[0],
									options: fig.title.l.map((font) => ({
										value: font,
										label: font,
									})),
								});
							}
						},
						changeSubtitle: () =>
							p.confirm({
								message: "Change subtitle font?",
								initialValue: true,
							}),
						subtitleFont: ({ results }) => {
							if (results.changeSubtitle) {
								return p.select({
									message: "Select subtitle font:",
									initialValue:
										(state.get(StateOptions.FigletSubtitle) as string) ||
										fig.subtitle.l[0],
									options: fig.subtitle.l.map((font) => ({
										value: font,
										label: font,
									})),
								});
							}
						},
					},
					{
						onCancel: () => {
							p.cancel("Operation cancelled.");
							return {
								changeTitle: false,
								titleFont: state.get(StateOptions.FigletTitle) as string,
								changeSubtitle: false,
								subtitleFont: state.get(StateOptions.FigletSubtitle) as string,
							};
						},
					}
				);

			let updated = false;
			const castTitle = (titleFont as TitleFonts) || fig.title.l[0];
			if (changeTitle && titleFont) {
				state.set(StateOptions.FigletTitle, castTitle);
				updated = true;
			}
			const castSubtitle = (subtitleFont as SubTitleFonts) || fig.subtitle.l[0];
			if (changeSubtitle && subtitleFont) {
				state.set(StateOptions.FigletSubtitle, castSubtitle);
				updated = true;
			}

			if (updated) {
				saveState({
					updates: {
						[StateOptions.FigletTitle]:
							(state.get(StateOptions.FigletTitle) as string) || castTitle,
						[StateOptions.FigletSubtitle]:
							(state.get(StateOptions.FigletSubtitle) as string) ||
							castSubtitle,
					},
				});
				this.lastAction = () => p.log.success("UI customization updated!");
			}
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		} catch (err) {
			this.lastAction = () => p.log.warn("Failed to updated UI");
			// If there's any error, go back to options screen
			await this.navigateTo(Screen.OPTIONS);
			this.resumeRendering();
			return;
		}
	}

	async renderStartScreen() {
		p.log.step("🧙‍♂️ Starting your quest line...");

		// Check if quest.toml exists, if not, help create it
		const questLocation = cwd() + "/quest.toml";
		if (!fs.existsSync(questLocation)) {
			p.log.info("No quest.toml found. Let's create one!");

			const quests = [];
			let continueAdding = true;
			let questId = 1;

			while (continueAdding) {
				const { name, description, points, addAnother } = await p.group(
					{
						name: () =>
							p.text({
								message: `Name for quest step ${questId}:`,
								placeholder: "Implement feature X",
								validate: (value) => {
									if (!value) return "Name is required";
								},
							}),
						description: () =>
							p.text({
								message: "Description:",
								placeholder: "Create the core functionality for X",
								validate: (value) => {
									if (!value) return "Description is required";
								},
							}),
						points: () =>
							p.text({
								message: "Points estimate (1-20):",
								placeholder: "3",
								validate: (value) => {
									const num = Number(value);
									if (isNaN(num) || num < 1 || num > 20) {
										return "Points must be a number between 1 and 20";
									}
								},
							}),
						addAnother: () =>
							p.confirm({
								message: "Add another quest step?",
								initialValue: true,
							}),
					},
					{
						onCancel: () => {
							if (quests.length === 0) {
								p.cancel("Operation cancelled. No quests created.");
								return {
									name: "",
									description: "",
									points: "",
									addAnother: false,
								};
							}
							return {
								name: "Cancelled",
								description: "User cancelled but keeping previous quests",
								points: "",
								addAnother: false,
							};
						},
					}
				);

				if (name && description && points) {
					quests.push({
						id: questId,
						name,
						description,
						points: Number(points),
						status: QuestStepStatus.PENDING,
					});

					questId++;
					continueAdding = addAnother;
				} else {
					break;
				}
			}

			if (quests.length > 0) {
				// Save quests to quest.toml
				const questToml = {
					ticket: quests,
				};

				const tomlContent = require("smol-toml").stringify(questToml);
				fs.writeFileSync(questLocation, tomlContent, "utf8");
				p.log.success("Quest file created successfully!");
			} else {
				this.lastAction = () =>
					p.log.error("No quests were created. Operation cancelled.");
				await this.navigateTo(Screen.HOME);
				this.resumeRendering();
				return;
			}
		}

		// Configure initial settings
		const { autogit, commitQuests, useHealthSchedule, scheduleType } =
			await p.group(
				{
					autogit: () =>
						p.confirm({
							message: "🤔 Auto-sync progress with git?",
							initialValue: false,
						}),
					commitQuests: ({ results }) => {
						if (results.autogit) {
							return p.confirm({
								message: "📝 Commit quest.toml + ctql-state.toml to git?",
								initialValue: false,
							});
						}
					},
					useHealthSchedule: () =>
						p.confirm({
							message: "Use a health schedule?",
							initialValue: true,
						}),
					scheduleType: ({ results }) => {
						if (results.useHealthSchedule) {
							return p.select({
								message: "Select schedule type:",
								initialValue: "default",
								options: [
									{
										value: "deep",
										label: "Deep Work",
										hint: "Longer focus periods",
									},
									{
										value: "default",
										label: "Default",
										hint: "Balanced approach",
									},
									{ value: "rapid", label: "Rapid", hint: "Frequent breaks" },
								],
							});
						}
					},
				},
				{
					onCancel: () => {
						p.cancel("Operation cancelled.");
						return {
							autogit: false,
							commitQuests: false,
							useHealthSchedule: false,
							scheduleType: "default",
						};
					},
				}
			);

		const castCommitQuests = (commitQuests as boolean) || false;
		// Save settings
		state.set(StateOptions.AutoGit, autogit);
		state.set(StateOptions.CommitQuests, castCommitQuests);
		const castScheduleSelection = scheduleType as "deep" | "default" | "rapid";
		const scheduleDec = {
			mode: castScheduleSelection,
		};
		if (useHealthSchedule && scheduleType) {
			state.set(StateOptions.Schedule, scheduleDec);
		}

		await saveState({
			updates: {
				[StateOptions.AutoGit]: autogit,
				[StateOptions.CommitQuests]: castCommitQuests,
				[StateOptions.Schedule]: useHealthSchedule
					? castScheduleSelection
					: undefined,
			},
		});

		// Initialize Git if requested
		if (autogit) {
			p.log.step("Configuring git...");
			const gitGuardRes = git.guard();
			if (!gitGuardRes.ok) {
				this.lastAction = () => p.log.error(gitGuardRes.err);
				await this.navigateTo(Screen.HOME);
				this.resumeRendering();
				return;
			}

			const gitInitRes = await git.init();
			if (!gitInitRes.ok) {
				this.lastAction = () => p.log.error(gitInitRes.err);
				await this.navigateTo(Screen.HOME);
				this.resumeRendering();
				return;
			}
		}

		// Start the first quest
		p.log.step("Taking first step...");
		const loadQuestRes = quest.load();
		if (!loadQuestRes.ok) {
			this.lastAction = () => p.log.error(loadQuestRes.err);
			await this.navigateTo(Screen.HOME);
			this.resumeRendering();
			return;
		}

		const quests = loadQuestRes.data;
		const startQuestRes = start.quest(quests);
		if (!startQuestRes.ok) {
			this.lastAction = () => p.log.error(startQuestRes.err);
			await this.navigateTo(Screen.HOME);
			this.resumeRendering();
			return;
		}

		p.log.success(startQuestRes.data.msg);

		if (autogit) {
			const gitCheckoutRes = await git.checkout(startQuestRes.data.name);
			if (!gitCheckoutRes.ok) {
				this.lastAction = () => p.log.error(gitCheckoutRes.err);
				await this.navigateTo(Screen.HOME);
				this.resumeRendering();
				return;
			}
			p.log.success(gitCheckoutRes.data.msg);
		}

		// Save state
		quest.save();
		saveState({ all: true });
		this.lastAction = () => p.log.success("🦅 Quest line initialized! 🏕️");
		await this.navigateTo(Screen.HOME);
		this.resumeRendering();
		return;
	}

	async handleDone() {
		console.clear();
		fig.title.p("CTQL");
		fig.subtitle.p("done");

		quest.load();
		const finishResponse = await done.finish();
		if (!finishResponse.ok) {
			this.lastAction = () => p.log.error(finishResponse.err);
			await this.navigateTo(Screen.HOME);
			this.resumeRendering();
			return;
		}

		quest.save();
		saveState({ all: true });

		console.clear();
		this.renderHomeScreen();
	}

	isQuestlineInitialized(): boolean {
		const questLocation = cwd() + "/quest.toml";
		const stateLocation = cwd() + "/ctql-state.toml";

		if (!fs.existsSync(questLocation) || !fs.existsSync(stateLocation)) {
			return false;
		}

		const currentQuestId = state.get(StateOptions.CurrentQuestId);
		return currentQuestId !== undefined;
	}

	startRendering() {
		if (!this.isPaused) {
			this.intervalId = setInterval(() => {
				console.clear();
				this.renderCurrentScreen();
			}, 1000);
		}
	}

	pauseRendering() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			this.isPaused = true;
		}
	}

	resumeRendering() {
		this.setupKeyListeners();
		if (this.isPaused) {
			if (process.stdin.isTTY) {
				// bring stdin back online…
				process.stdin.resume();
				// re-emit keypress events…
				readline.emitKeypressEvents(process.stdin);
				// raw mode so we see each key immediately
				process.stdin.setRawMode(true);
			}
			this.isPaused = false;
			this.startRendering();
		}
	}

	cleanupAndExit() {
		console.log("Exiting...???");
		this.pauseRendering();
		console.clear();
		exitMsg("Clock is still ticking.");
	}
}

// Legacy compatibility for direct commands
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
	return;
}

// Main entry point
async function main() {
	const loadStateRes = loadState();
	if (!loadStateRes.ok) {
		exitMsg(loadStateRes.err);
	}

	const subcommand = Bun.argv[2];

	if (!subcommand) {
		// Old CLI menu flow for backward compatibility
		fig.title.p("CTQL");
		p.intro("⚔️  Quest Log 🏰");
		console.clear();
		const ui = new KeystrokeUI();
		ui.navigateTo(Screen.HOME);
	} else if (subcommand === "done") {
		// Direct done command
		await handleDone();
	} else {
		// New keystroke UI for all other subcommands
		console.clear();
		const ui = new KeystrokeUI();
		// Handle specific subcommands by mapping to screens
		if (subcommand === "stats") {
			ui.navigateTo(Screen.STATS);
		} else if (subcommand === "git") {
			ui.navigateTo(Screen.GIT);
		} else if (subcommand === "decorate") {
			ui.navigateTo(Screen.DECORATE);
		} else if (subcommand === "health") {
			ui.navigateTo(Screen.HEALTH);
		}
	}
}

main();

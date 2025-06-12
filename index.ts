#!/usr/bin/env bun

import * as p from "@clack/prompts";
import { execSync } from "child_process";

async function main() {
	p.intro("Running Deko");
	const group = await p.group(
		{
			name: () => p.text({ message: "What is your project called?" }),
			install: ({ results }) =>
				p.confirm({ message: "Auto-install dependencies? " }),
		},
		{
			onCancel: ({ results }) => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		}
	);

	if (group.name) {
		if (group.name.includes(" ")) {
			group.name = group.name.replaceAll(" ", "-");
		}
	}

	try {
		execSync("git --version", { stdio: "ignore" });
	} catch {
		p.cancel("Git is not installed. Please install Git to proceed.");
		process.exit(1);
	}

	const clonePrisma = p.tasks([
		{
			title: "Cloning Prisma...",
			task: async (message) => {
				await Bun.$`git clone https://github.com/mackenziebowes/deko-orm-prisma.git ./${group.name}/prisma`;
				if (group.install) {
					await Bun.$`bun i`.cwd(`./${group.name}/prisma`);
				}
				return "Cloned Prisma";
			},
		},
	]);

	const cloneSolid = p.tasks([
		{
			title: "Cloning Solid...",
			task: async (message) => {
				await Bun.$`git clone https://github.com/mackenziebowes/deko-client-solid.git ./${group.name}/client`;
				if (group.install) {
					await Bun.$`bun i`.cwd(`./${group.name}/client`);
				}
				return "Cloned Solid";
			},
		},
	]);

	const cloneHono = p.tasks([
		{
			title: "Cloning Hono...",
			task: async (message) => {
				await Bun.$`git clone https://github.com/mackenziebowes/deko-server-hono.git ./${group.name}/server`;
				if (group.install) {
					await Bun.$`bun i`.cwd(`./${group.name}/server`);
				}
				return "Cloned Hono";
			},
		},
	]);

	await Promise.all([clonePrisma, cloneSolid, cloneHono]);
	p.outro("Deko Complete");
}

main();

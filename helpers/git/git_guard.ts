import type { HelperResponse } from "./types";
import { execSync } from "node:child_process";

export function gitGuard(): HelperResponse {
	try {
		execSync("git --version", { stdio: "ignore" });
		return { ok: true, data: null };
	} catch {
		return {
			ok: false,
			err: "❌ Git is not installed. Please install Git to proceed. 🤔",
		};
	}
}

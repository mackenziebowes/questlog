import { gitGuard } from "./git_guard";
import { gitCheckout } from "./gitCheckout";
import { gitInit } from "./initGit";
import { gitCommit } from "./gitCommit";

const git = {
	guard: gitGuard,
	checkout: gitCheckout,
	init: gitInit,
	commit: gitCommit,
};

export default git;

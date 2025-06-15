import fig from "./figlet";
export function exitMsg(message: string) {
	console.log();
	console.error(message);
	fig.subtitle.p("goodbye");
	console.log();
	process.exit(0);
}

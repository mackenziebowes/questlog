import * as p from "@clack/prompts";
import fig from "../decorators/figlet";
interface ConfettiArgs {
	duration?: number;
	width?: number;
	height?: number;
	messages: string[];
	progressMsg?: string;
}
// duration = 2000, width = 32, height = 8
export async function confetti(args: ConfettiArgs) {
	const duration = args.duration || 2000;
	const width = args.width || 32;
	const height = args.height || 8;
	const start = Date.now();

	const sparkleChars = ["*", "~", ".", "'", "·", "°", "+"];
	const getRandomChar = () =>
		sparkleChars[Math.floor(Math.random() * sparkleChars.length)];

	const drawFrame = () => {
		let frame = "\n";
		for (let y = 0; y < height; y++) {
			let row = "";
			for (let x = 0; x < width; x++) {
				row += Math.random() < 0.08 ? getRandomChar() : " ";
			}
			frame += row + "\n";
		}

		// Add messages below the frame
		const messageIndex =
			Math.floor((Date.now() - start) / 500) % args.messages.length;
		frame += args.messages[messageIndex] + "\n";
		if (args.progressMsg) {
			frame += `${args.progressMsg}\n`;
		}

		return frame;
	};

	// Hide cursor
	process.stdout.write("\x1B[?25l");

	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			fig.title.p("CTQL");
			fig.subtitle.p("quest");
			fig.subtitle.p("complete!");
			// Clear screen and move to top-left
			process.stdout.write("\x1Bc");

			// Draw frame
			process.stdout.write(drawFrame());

			// Check duration
			if (Date.now() - start > duration) {
				clearInterval(interval);
				process.stdout.write("\x1Bc"); // Final clear
				process.stdout.write("\x1B[?25h"); // Show cursor
				resolve();
			}
		}, 100);
	});
}

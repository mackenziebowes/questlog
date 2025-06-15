import figlet from "figlet";
import { state, StateOptions } from "../state";

function title(message: string) {
	const figletTitleCase = ((state.get(
		StateOptions.FigletTitle
	) as TitleFonts) || "ANSI Shadow") as TitleFonts;
	console.clear();
	console.log();
	printFigletText(message, figletTitleCase);
	console.log();
}

function subtitle(message: string) {
	const figletSubtitleCase = ((state.get(
		StateOptions.FigletSubtitle
	) as SubTitleFonts) || "Chunky") as SubTitleFonts;
	printFigletText(message, figletSubtitleCase);
	console.log();
}

type TitleFonts =
	| "Delta Corps Priest 1"
	| "Alligator2"
	| "ANSI Shadow"
	| "Cosmike"
	| "Hollywood";
type SubTitleFonts =
	| "Soft"
	| "Standard"
	| "Sub-Zero"
	| "Chunky"
	| "Cricket"
	| "Invita";

type CtqlFiglet = TitleFonts | SubTitleFonts;

function printFigletText(text: string, font: CtqlFiglet) {
	console.log(
		figlet
			.textSync(text, font)
			.split("\n")
			.map((line) => " ".repeat(4) + line)
			.join("\n")
	);
}

const TitleFontsArray: TitleFonts[] = [
	"Delta Corps Priest 1",
	"Alligator2",
	"ANSI Shadow",
	"Cosmike",
	"Hollywood",
];

const SubTitleFontsArray: SubTitleFonts[] = [
	"Soft",
	"Standard",
	"Sub-Zero",
	"Chunky",
	"Cricket",
	"Invita",
];

const figexport = {
	title: {
		l: TitleFontsArray,
		p: title,
	},
	subtitle: {
		l: SubTitleFontsArray,
		p: subtitle,
	},
};

export default figexport;

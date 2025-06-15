export type Block = { label: string; mins: number };
export type BlockOptionDeclaration = {
	name: string;
	cycle_length: number; // minutes
	blocks: Block[];
};

/* Flattens block definitions into cumulative ranges
   e.g. Deep 50/10 becomes:
   [ {start:0,end:50,label:'🧠 Deep Work'},
     {start:50,end:60,label:'🏃 Movement'} ] */
function expandBlocks(schedule: BlockOptionDeclaration) {
	let cursor = 0;
	return schedule.blocks.map((b) => {
		const range = { start: cursor, end: cursor + b.mins, label: b.label };
		cursor += b.mins;
		return range;
	});
}

const defaultBlocks: BlockOptionDeclaration = {
	name: "Default",
	cycle_length: 60,
	blocks: [
		{ label: "🧠 Deep Work", mins: 25 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🏃 Movement", mins: 25 },
		{ label: "🔄 Transition", mins: 5 },
	],
};

const deepBlocks: BlockOptionDeclaration = {
	name: "Deep",
	cycle_length: 60,
	blocks: [
		{ label: "🧠 Deep Work", mins: 50 },
		{ label: "🏃 Movement", mins: 10 },
	],
};

const rapidBlocks: BlockOptionDeclaration = {
	name: "Rapid",
	cycle_length: 120,
	blocks: [
		{ label: "🧠 Deep Work", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🏃 Movement", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🧠 Deep Work", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🏃 Movement", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🧠 Deep Work", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
		{ label: "🏃 Movement", mins: 15 },
		{ label: "🔄 Transition", mins: 5 },
	],
};

const def = {
	default: defaultBlocks,
	deep: deepBlocks,
	rapid: rapidBlocks,
};

const expanded = {
	default: expandBlocks(def.default),
	deep: expandBlocks(def.deep),
	rapid: expandBlocks(def.rapid),
};

function currentBlock(
	schedule: BlockOptionDeclaration,
	now: Date = new Date()
) {
	const minsIntoHour = now.getMinutes(); // 0-59
	const minsIntoCycle = minsIntoHour % schedule.cycle_length;
	const table = expandBlocks(schedule);

	return table.find((r) => minsIntoCycle >= r.start && minsIntoCycle < r.end)!;
}

const blocks = {
	def,
	expanded,
	current: currentBlock,
};

export default blocks;

import type { TomlPrimitive } from "smol-toml";

type HelperSuccess = {
	ok: true;
	data: any;
};

type HelperFail = {
	ok: false;
	err: string;
};

export type HelperResponse = HelperSuccess | HelperFail;

export type DeclaredQuest = {
	id: number;
	name: string;
	description: string;
	points: number;
};

export enum QuestStepStatus {
	PENDING = "pending",
	STARTED = "started",
	FINISHED = "finished",
}

export type LoadedQuest = DeclaredQuest & {
	timeStarted?: Date;
	timeFinished?: Date;
	status: QuestStepStatus;
};

export type LoadedQuests = Map<number, LoadedQuest>;

export type Primitive =
	| string
	| number
	| Date
	| boolean
	| string[]
	| Date[]
	| boolean[];

export type NestedPrimitive =
	| Primitive
	| Record<string, Primitive | TomlPrimitive | TomlPrimitive[]>
	| Record<string, Primitive | TomlPrimitive | TomlPrimitive[]>[];

export type CTQLState = Map<string, NestedPrimitive | TomlPrimitive>;

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
	PENDING,
	STARTED,
	FINISHED,
}

export type LoadedQuest = DeclaredQuest & {
	timeStarted?: Date;
	timeFinished?: Date;
	status: QuestStepStatus;
};

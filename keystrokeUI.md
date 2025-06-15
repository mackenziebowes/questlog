# Keystroke UI ideas

This CLI is meant to be used with "riced" Linux systems - an interactive TUI that feels like a toy or game but helps with productivity.

To that end, we're taking inspiration from early TUI RPGs.

On each frame, we need to contextually deliver instructions for what the user might do, as well as detailed information about their current "location" in the program.

## Default/"Home" Screen

Starting around line 201 in index.ts, there's an example implementation of the looping stats screen.
Keylisteners are added and handled, and the `stats` screen is set to animate around line 241.
The new "Default" screen you'll implement should basically be equivalent to `stats` most of the time - after the questline has been initialized until it is complete, there's always something to do, and `stats` shows a timer countdown and details about the currently active quest step.

## Keystroke <> Function pairs

### [s]tart

Starts default onboarding pathway.

#### Check Quests

Checks for existing quest.toml - if none set, perhaps the user enters a loop of manually declaring quests via @clack/prompt groups. See existing index.ts for an example in `main` starting on around line 15.

#### Adding a quest steps

1. Name step (string)
2. Describe step (string)
3. Points estimate (1-20)
4. Add another? (**y**/n)
   Cancelling continues along the flow.

#### Initialize

Additionally, initializes "game" state.
User has to declare (or accept default values) for the following:

1. Sync with Git? (y/**n**)
2. (if syncing) Commit quest.toml + ctql-state.toml to git (y/**n**)
3. Use a health-schedule (**y**/n)
4. (if health-scheduling) Which schedule? ("deep"/**"default"**/"rapid")
   After declaring these four variables, they are saved to `ctql-state.toml`

#### Embarking

The first quest must be configured as active `state.set("currentQuestId", 1)`
Then, the user is ready to see the `stats` screen.

### [q]uit

Always Available.
Exits the process using helpers/decorators/exit_msg

### [d]one

Only available if:

- ctql-state.toml and quest.toml exist and are valid
- there is a currently active quest

#### Mark Complete

See inside of /helpers/done/finishQuest for details - the confetti is very important!

#### Load Next Quest

See /helpers/done/nextQuest for details.

Marking a quest **done** _immediately_ starts the next quest in line, this is very important so the user feels supported and is aware of task progress.

### [o]ptions

Only available if:

- ctql-state.toml and quest.toml exist and are valid

Displays a screen enabling the user to config their stuff, like for example

#### [g]it

Allows the user to reset their git sync preferences, which are:

1. Sync with Git? (y/**n**)
2. (if syncing) Commit quest.toml + ctql-state.toml to git (y/**n**)

#### [h]ealth

Only available if:

- ctql-state.toml and quest.toml exist and are valid

Allows the user to update their health-schedule details, which are:

1. Use a health-schedule (**y**/n)
2. (if health-scheduling) Which schedule? ("deep"/**"default"**/"rapid")

#### [d]ecorate

Only available if:

- ctql-state.toml and quest.toml exist and are valid

A small sub-menu for choosing from a list of fonts for the figlet `title` and `subtitle` default fonts, stored in state.

Use a @clack/prompt group to determine:

1. Change Title? (**y**/n)
2. If changing title, select from (list available in helpers/decorators/figlet's default export, `figexport.title.l` (l for list))
3. Change Subtitle? (**y**/n)
4. If changing subtitle, select from (list available in helpers/decorators/figlet's default export, `figexport.subtitle.l` (l for list))

### [b]ack

Contextual - available if inside of a non-default screen.

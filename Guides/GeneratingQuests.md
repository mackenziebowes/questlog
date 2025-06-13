# How to Generate Quest Lines

Use AI obviously. LLMs are amazing interpolators! Use this framework with whatever provider you like:

## Describe your idea to the LLM

Be detailed! Try your best to outline your desired stack, who the thing is for, what problem it solves, etc. Ask for feedback!

Example starting point:

```md
I want your help with Operationalizing myself - making a personal Skyrim Quest Log with analytics so I don't get lost.

Here's some of my ideas:

- Use some kind of structured local data (possibly TOML or JSON, something that can be serialized)
- Use a CLI to "Load" a "Quest Line" (details at the end)
- Once a Quest Line is Loaded, the clock starts. The task at the top of the list is marked in progress with a timeStarted automatic timestamp.
- The CLI has a "Done" command that:
  - Marks the task as complete
  - timestamps the timeFinished timestamp
  - Marks the next task as in progress
  - timestamps the timeStarted on the next task
- The CLI has a "Stats" command that shows:
  - Tasks Completed / Tasks remaining in Quest Line (percentage)
  - Average time per task
- Scoped to specific project folders

Importantly, this tracks calendar time, not "work time."
Answers the question: "How many days of your life did this cost?" and allows the user to ask "Am I happy with that?"

The more I talk about this the more excited I get. Lowkey, converting this from local file to cli accounts + server backend allows for leaderboards and solo-dev speedrunners, lol.

But for right now, I just need local first for myself - a reality check for the clock-cost of ADHD.

What do you think from a psych perspective?
```

## Let the LLM Respond

I really don't know if this needs to be said to an audience of developers, but most LLMs are optimized for multiturn chat, so let it have a turn.
Trying to get everything done in one prompt doesn't work as well as _using multiple turns_.
Chat with it, ideate, ask for project name ideas, ask about potential stretch goals, whatever you want to do here.

The important thing here is to let the LLM generate some chat history between requests so it loads more focused details into context.

## Ask for a One-Pager

Direct the LLM to perform one of it's favourite tasks, Interpolation.
Basically, this step is asking it to convert the context into a summary. Give it an example of the kind of summary you want.

Here's a great template:

```md
# Questlog – A Skyrim-Style Quest Tracker for Real Life

**Questlog** turns your daily tasks into structured, time-tracked quests — helping you see exactly where your time goes, one mission at a time.

_Track progress. Slay distractions. Win back your day._

---

## 🎯 What It Does

Questlog is a local-first CLI that helps you:

- Load a **Quest Line** (project or objective)
- Track each **task’s real-world time cost**
- Auto-advance to the next step when you're done
- Get clear stats on your pace, completion rate, and total life-hours spent

> "It took me 6.3 calendar days to finish this project. Am I okay with that?"

---

## 🧭 How It Works

- `questlog load quest.toml`  
  Load a structured task list. Clock starts immediately.

- `questlog done`  
  Marks the current task complete and starts the next one automatically.

- `questlog stats`  
  Shows progress, % complete, average task duration, and total elapsed time.

Each task logs:

- `timeStarted`
- `timeFinished`
- Status (`todo`, `in_progress`, `complete`, `dormant`)

---

## ✨ Features

- 📜 Simple, readable data format (TOML or JSON)
- 🕰 Tracks _calendar time_ — not just work hours
- 📊 Built-in stats for self-awareness and reflection
- 📁 Scoped to project folders (one questlog per repo)
- 🧠 Zero-config — just drop in a `.questlog.toml` and go

---

## 🧠 Why It Helps

- Beat **time blindness** with hard timestamps
- Tame **task overload** with one active quest at a time
- Combat **avoidance loops** by seeing your wins
- Reflect honestly: "How long do things _really_ take me?"

---

## 🛠 Tech Stack

- **Runtime**: Bun
- **CLI Framework**: Clack
- **Data Format**: TOML + JSON
- **Local-First**: No login, no servers, no tracking

---

## 🚧 Roadmap

- ASCII confetti + loot drops on task completion
- Daily “rename the quest” prompt for narrative reflection
- Mid-quest `refactor` to split/merge tasks without losing history
- Optional sync + public speedrun leaderboards for teams

---

> Questlog doesn’t just help you finish projects.  
> It helps you **face the clock** — and start winning again.
```

## Ask for Point Estimates

This is where you turn to a Reasoning model like R1 or o3.

Say something like: "Okay, awesome. Now, could you inventory all our features into points estimates using this rubric: \[paste-rubric-here\]"

- Let's the LLM do it's best task: interpolation
- The chat context is focused and detailed
- Clear conditions of success

Here's an example rubric you could paste in:

```md
## Point Estimates – Solo Mode Edition

| Points     | Description                                   | Example                                |
| ---------- | --------------------------------------------- | -------------------------------------- |
| 1 point    | < 1 hour, shallow logic or isolated component | Button UI, helper function, Zod schema |
| 2 points   | 1–2 hrs, minor feature or integration         | Auth callback handler, Stripe checkout |
| 3 points   | 2–4 hrs, meaningful logic or new page         | Single-product flow with LLM call      |
| 5 points   | ½ day+, multiple moving parts                 | OAuth + DB wiring, batch queuing       |
| 8 points   | Full-day+ spike, nontrivial architecture      | m×n batch worker + progress eventing   |
| 13+ points | Multiple days, high risk/unknowns             | A/B infra, analytics with time series  |
```

## Convert to TOML

After the AI gives you your ticketing back (or, if you're feeling dangerous/have done this before with a memory enabled system like ChatGPT, before then) you can just ask the model to convert the Inventory into a Sprint system and return TOML.
I would usually use a Reasoning model for this as well, as it's kind of two tasks:

1. Organize the flat ticket inventory into collections
2. Organize the collections from loose text into TOML

You can use this example as a template for your model:

```md
# Questlog – Ticket Inventory (points = dev-hours scale)

# -------------------------------------------------------------------

# MVP CORE

# -------------------------------------------------------------------

[[ticket]]
id = 1
title = "CLI scaffold & questlog init"
description = "Bun + Clack setup, env checks, baseline command tree"
points = 2

[[ticket]]
id = 2
title = "load command"
description = "Parse quest.toml/json, create .queststate.json, start timer"
points = 3

[[ticket]]
id = 3
title = "done command"
description = "Mark current task complete, auto-advance next, timestamp"
points = 3

[[ticket]]
id = 4
title = "stats command"
description = "Show % complete, avg task duration, total elapsed time"
points = 2

[[ticket]]
id = 5
title = "Repo-root discovery"
description = "Walk up dirs to find quest file (Git-style)"
points = 2

# -------------------------------------------------------------------

# DATA & VALIDATION

# -------------------------------------------------------------------

[[ticket]]
id = 6
title = "TOML schema + Zod validation"
description = "Prevent corrupt logs, enable future versioning"
points = 2

# -------------------------------------------------------------------

# GIT INTEGRATION (OPT-IN)

# -------------------------------------------------------------------

[[ticket]]
id = 7
title = "Auto-commit on task start/finish"
description = "git init if missing, update .gitignore, semantic commit msgs"
points = 3

[[ticket]]
id = 8
title = "--no-git flag + dirty-repo warning"
description = "Respect existing workflows; allow disabling Git hooks"
points = 2

# -------------------------------------------------------------------

# QUALITY-OF-LIFE / PSYCH LOOPS

# -------------------------------------------------------------------

[[ticket]]
id = 9
title = "ASCII confetti / sound on done"
description = "Instant dopamine hit on task completion"
points = 1

[[ticket]]
id = 10
title = "Dormant status"
description = "Auto-mark tasks stuck >72 h as dormant"
points = 2

[[ticket]]
id = 11
title = "Back-fill start time"
description = "Gracefully handle forgotten load command"
points = 2

[[ticket]]
id = 12
title = "bookmark command"
description = "Stash open files / branch; reopen on reload"
points = 3

[[ticket]]
id = 13
title = "refactor command"
description = "Split / merge tasks mid-quest without losing history"
points = 3

[[ticket]]
id = 14
title = "Arousal-level tags"
description = "🟢🟡🔴 tags + filter in stats"
points = 2

[[ticket]]
id = 15
title = "Daily rename prompt"
description = "End-of-day narrative reframing for active quest"
points = 2

[[ticket]]
id = 16
title = "Variable-ratio Easter eggs"
description = "Random loot drops every N completions"
points = 2

# -------------------------------------------------------------------

# ANALYTICS / DASHBOARDS

# -------------------------------------------------------------------

[[ticket]]
id = 17
title = "Extended stats"
description = "Per-day burndown, task histogram, deeper insights"
points = 3

# -------------------------------------------------------------------

# SYNC & SOCIAL (POST-MVP)

# -------------------------------------------------------------------

[[ticket]]
id = 18
title = "Cloud sync"
description = "Local file → simple REST backend for multi-device + backups"
points = 8

[[ticket]]
id = 19
title = "Leaderboards / dashboards"
description = "Public speedruns, team boards, community gamification"
points = 8

# -------------------------------------------------------------------

# DESKTOP / QUICK ENTRY

# -------------------------------------------------------------------

[[ticket]]
id = 20
title = "Raycast / Tauri mini-window"
description = "1-click done; reduce context-switch friction"
points = 5

# -------------------------------------------------------------------

# SHIP & MAINTAIN

# -------------------------------------------------------------------

[[ticket]]
id = 21
title = "Unit tests & CI"
description = "bun test + GitHub Actions for regression safety"
points = 2

[[ticket]]
id = 22
title = "Publish to npm + semantic-release"
description = "npx questlog global install, automated versioning"
points = 2
```

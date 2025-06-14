# CTQL: Clock Time Quest Log – An RPG-Style Quest Tracker for Solo Devs

**ctql** turns your daily tasks into structured, time-tracked quests — helping you see exactly where your time goes, one mission at a time.

_Track progress. Slay distractions. Win back your day._

---

## What It Does

ctql is a local-first CLI that helps you:

- Load a **Quest Line** (project or objective)
- Track each **task’s real-world time cost**
- Auto-advance to the next step when you're done
- Get clear stats on your pace, completion rate, and total life-hours spent

> "It took me 6.3 calendar days to finish this project. Am I okay with that?"

---

## Usage

- `npx ctql`
  Opens an interactive menu where you can select between loading a quest line, finishing a quest, seeing your stats, and turning on/off git sync. Loading a quest line also starts the clock on the first task.

- `ctql done`  
  Marks the current task complete and starts the next one automatically. If you have git sync enabled, this also commits your current repo (`git add .`) and opens a new branch.

- `ctql stats`  
  Shows current ticket data including time elapsed, questline progress, % complete, average task duration, and total elapsed time for the entire project.

- `ctql git`
  Allows you to enable/disable git sync.

Each task logs:

- `timeStarted`
- `timeFinished`
- Status (`pending`, `in_progress`, `finished`)

---

## Where Do I Get Quests?

See Guides/Generating Quests

---

## Features

- 📜 Simple, readable data format (TOML)
- 🕰 Tracks _calendar time_ — not just work hours
- 📊 Built-in stats for self-awareness and reflection
- 📁 Scoped to project folders (one quest line per repo)
- 🧠 Zero-config — just drop in a (formatted) `.quest.toml` and go

---

## Why It Helps

- Beat **time blindness** with hard timestamps
- Tame **task overload** with one active quest at a time
- Combat **avoidance loops** by seeing your wins
- Reflect honestly: "How long do things _really_ take me?"

---

## Tech Stack

- **Runtime**: Bun
- **CLI Framework**: Clack
- **Data Format**: TOML
- **Local-First**: No login, no servers, no tracking

---

## Roadmap

- Mid-quest `refactor` to split/merge tasks without losing history
- Optional online sync + public speedrun leaderboards for teams / grinders

---

> ctql doesn’t just help you finish projects.  
> It helps you **face the clock** — and start winning again.

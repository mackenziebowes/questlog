# Questlog – An RPG-Style Quest Tracker for Solo Devs

**Questlog** turns your daily tasks into structured, time-tracked quests — helping you see exactly where your time goes, one mission at a time.

_Track progress. Slay distractions. Win back your day._

---

## What It Does

Questlog is a local-first CLI that helps you:

- Load a **Quest Line** (project or objective)
- Track each **task’s real-world time cost**
- Auto-advance to the next step when you're done
- Get clear stats on your pace, completion rate, and total life-hours spent

> "It took me 6.3 calendar days to finish this project. Am I okay with that?"

---

## How It Works

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

## Where Do I Get Quests?

See Guides/Generating Quests

---

## Features

- 📜 Simple, readable data format (TOML or JSON)
- 🕰 Tracks _calendar time_ — not just work hours
- 📊 Built-in stats for self-awareness and reflection
- 📁 Scoped to project folders (one questlog per repo)
- 🧠 Zero-config — just drop in a `.questlog.toml` and go

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
- **Data Format**: TOML + JSON
- **Local-First**: No login, no servers, no tracking

---

## Roadmap

- ASCII confetti + loot drops on task completion
- Mid-quest `refactor` to split/merge tasks without losing history
- Optional sync + public speedrun leaderboards for teams

---

> Questlog doesn’t just help you finish projects.  
> It helps you **face the clock** — and start winning again.

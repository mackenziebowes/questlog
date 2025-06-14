# QuestSpec

A short guide to writing quest lines for yourself and your LLM friends.

## TOML Demands

The CLI makes some demands about processing data.

Let's take a look at an example, first:

```toml
[[ticket]]
id          = 1
name        = "CLI scaffold & questlog init"
description = "Bun + Clack setup, env checks, baseline command tree"
points      = 2

[[ticket]]
id          = 2
name        = "load command"
description = "Parse quest.toml/json, create .queststate.json, start timer"
points      = 3

[[ticket]]
id          = 3
name        = "done command"
description = "Mark current task complete, auto-advance next, timestamp"
points      = 3
```

Your questline **must have _exactly_** these parameters:

- `heading` is exactly `[[ticket]]` (will be string split)
- `id` is number (and unique, they are loaded into a Map)
- `name` is string
- `description` is string
- `points` is number

## Point Expectations

These are softer, but it improves QoL.
I assume you are a solo dev, so I use this rubric for points:

```md
| Points     | Description                                   | Example                                |
| ---------- | --------------------------------------------- | -------------------------------------- |
| 1 point    | < 1 hour, shallow logic or isolated component | Button UI, helper function, Zod schema |
| 2 points   | 1–2 hrs, minor feature or integration         | Auth callback handler, Stripe checkout |
| 3 points   | 2–4 hrs, meaningful logic or new page         | Single-product flow with LLM call      |
| 5 points   | ½ day+, multiple moving parts                 | OAuth + DB wiring, batch queuing       |
| 8 points   | Full-day+ spike, nontrivial architecture      | m×n batch worker + progress eventing   |
| 13+ points | Multiple days, high risk/unknowns             | A/B infra, analytics with time series  |
```

These estimates come from an LLM, which is trained on data from before LLMs mostly!
They're a little pessimistic.

> One of the cutest things that LLMs do is estimate some feature will take 2 weeks as if I'm not about to force Claude Code to do it in the next 20 minutes.

The CLI will look at your ticket's estimated points and convert that into a time-box.
Use this rubric so the CLI's actions make sense - IE, giving something 25 points and getting it done in an hour should make you reflect on **your estimation skills**,
but the CLI will simply congratulate you. **Hollow victory,** wouldn't you say?

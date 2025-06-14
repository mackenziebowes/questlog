# Changelog

Starting from 0.0.4 because I forgot to start at 0.0.1

## 0.0.6

- Fixed bug in "git sync" feature
  - I really need to enumerate my function return types. `data: any` is poison and I shot myself in the foot.

## 0.0.5

- Made "git sync" features do more stuff
  - Optional "CommitQuests" flag that adds/removes quest.toml and ctql-state.toml from your repo.
  - Useful for showing off stats.

Obviously, these are user-editable, so timestamps should be taken with a grain of salt, but maybe someone wants to share quests with themselves on other machines or with others.

## 0.0.4

- Added more details to Guides/QuestSpec.md
- Improved stats feature
  - Now adds timeElapsed from current ticket to total elapsed time
  - Better microcopy around hidden/unset QuestLine stats
- Added `ctql git`
  - Turn on/off git sync with 1 less keystroke!
  - Efficient ✅
- Improved ReadMe
  - Removed LLM-Generated suggestions
  - Marked off Future Roadmap Features that are already included
  - Fixed incorrect LLM-Generated suppositions
- Added Changelog obvi

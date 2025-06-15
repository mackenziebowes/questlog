# CTQL (Clock Time Quest Log) Repository Documentation

## Core Files
- **index.ts**: Main entry point for the CLI application, handles commands (start, done, stats, git)
- **package.json**: Project configuration with dependencies like @clack/prompts, figlet, and smol-toml
- **tsconfig.json**: TypeScript configuration

## Helpers Directory Structure

### State Management
- **helpers/state.ts**: Manages application state using TOML file storage
  - Saves/loads state between sessions
  - Tracks quest progress, time elapsed, Git settings

### Quest Handling
- **helpers/quest_handling.ts**: Core functionality for quest management
  - Loads quests from quest.toml files
  - Tracks quest status (pending, started, finished)
  - Maintains quest metadata

### Types
- **helpers/types.ts**: TypeScript type definitions for the application

### Time Utilities
- **helpers/time.ts**: Time calculation and formatting utilities
- **helpers/points_to_time_goal.ts**: Converts point estimates to time goals

### Progress Visualization
- **helpers/progress.ts**: Generates progress bars for CLI

### /decorators
- **figlet.ts**: Provides ASCII art text rendering for CLI
- **exit_msg.ts**: Handles graceful exit messaging

### /done
- **index.ts**: Exports from the done module
- **finishQuest.ts**: Marks current quest as complete
- **confetti.ts**: Celebration effects on completion
- **nextQuest.ts**: Advances to the next quest

### /start
- **index.ts**: Exports from the start module
- **startQuest.ts**: Initializes a quest and starts time tracking

### /git
- **index.ts**: Exports from the git module
- **gitCheckout.ts**: Creates branches for quests
- **gitCommit.ts**: Handles git commits for quests
- **git_guard.ts**: Validates Git setup
- **initGit.ts**: Initializes Git integration
- **sanitizeQuestName.ts**: Cleans quest names for Git usage

### /stats
- **index.ts**: Provides quest statistics and progress visualization

### /schedule
- **alerts.ts**: Time-based notifications
- **blocks.ts**: Time block management
- **notify.ts**: User notification system
- **schedule.ts**: Scheduling functionality

## User Flow
1. User creates a quest.toml file with task definitions
2. Start a quest line with `ctql` or `ctql start`
3. Work on current task and mark complete with `ctql done`
4. View progress with `ctql stats`
5. Configure Git integration with `ctql git`

The system helps developers track time spent on tasks, providing insights into estimation accuracy and overall project duration.
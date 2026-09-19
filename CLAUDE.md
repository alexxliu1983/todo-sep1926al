# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

Static, dependency-free browser app (plain HTML/CSS/JS). There is no build, package manager, linter, or test suite. Open `index.html` in a browser and reload after edits. Node is not installed on the dev machine, so `node --check app.js` is unavailable; verify changes in the browser and check the console.

## Architecture

Everything is in three files loaded by `index.html`: `app.js` (all logic, no modules), `style.css`, and the static markup. `specs.md` is the product spec and should be kept in sync with behavior changes.

- **State + render loop:** a single `tasks` array (`{ id, text, done, priority, dueDate }`) is the source of truth. Every mutation follows the same pattern: change state, `save()`, `render()`. `render()` rebuilds the whole `<ul>` from scratch via `visibleTasks()`, so never mutate the DOM directly; change state and re-render. The counter, filter-button state, and disabled state of "Clear completed" are also set inside `render()`.
- **`tasks` array order is insertion order and is what gets persisted.** Display order comes from `visibleTasks()` (filter, then search, then sort), which never reorders `tasks`. Undo depends on this: `removeTasks()` records each removed task's index in `tasks`, and the Undo handler splices them back in ascending index order.
- **Persistence:** `localStorage` keys `todo-tasks` (JSON array) and `todo-theme`. `load()` normalizes older saved tasks (missing `priority` becomes `medium`, missing `dueDate` becomes `null`); do the same when adding a new task field. All storage access is in try/catch and must stay that way. Filter, search text, edit mode and the undo buffer are in-memory only.
- **Inline editing:** `editingId` marks the task being edited; `makeTextCell()` returns an `<input>` for it, and `render()` focuses it afterward. The `finished` flag in `makeTextCell()` exists because Enter/Escape trigger a re-render, which fires `blur` on the removed input; keep the guard.
- **Theming and priority colors (CSS):** light/dark palettes are CSS variables on `:root` and `:root[data-theme="dark"]`, toggled by `applyTheme()` setting `document.documentElement.dataset.theme`. Each task `<li>` gets a `priority-*` class that sets a local `--p` custom property, which drives the row tint, left stripe, priority pill, and checkbox color. Priority colors are deliberately identical in both themes so the pill's white text stays readable.
- **Task text is inserted with `textContent`, never `innerHTML`.** Keep it that way to avoid HTML injection. (`list.innerHTML = ''` is only used to clear.)

## Known issues (current code)

- The global `keydown` handler for the `1`/`2`/`3` priority shortcut only checks `editingId`, so typing those digits in the add-task box, search box, or date field changes the priority of the first visible task. It should ignore events from form fields.
- `getDueDateStatus()` and `formatDueDate()` parse `YYYY-MM-DD` with `new Date(str)` (UTC midnight) and then use local-time methods, so in time zones west of UTC due dates display and classify one day early. Parse the parts as a local date instead.
- `specs.md` does not yet describe due dates, the keyboard shortcuts, or the current sort order (due-date status first, then priority), and its priority sort description is out of date.

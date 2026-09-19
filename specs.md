# Plan for a To Do app

Specifications
1. simple to do app. No frills. Basic.
2. it should run in a browse
3. each task has a priority (High, Medium or Low), chosen when the task is added and changeable later
   - the list is sorted High, then Medium, then Low; tasks with the same priority stay in the order they were added
   - each task shows its priority clearly: a colored pill with the priority name, a thick colored stripe on the left edge, and a light tint of the same color on the row (red = High, orange = Medium, green = Low)
   - tasks saved before priorities existed are treated as Medium
4. dark mode option
   - an icon button in the top right switches between light and dark mode (moon in light mode, sun in dark mode)
   - the first visit follows the system setting; after that the saved choice is used
5. edit a task's text: double-click it; Enter or clicking away saves, Escape cancels; an empty edit is not saved
6. clear completed: one button removes all finished tasks (disabled when there are none)
7. filter: All / Active / Done
8. counter: shows how many tasks are still not done ("3 tasks left"), regardless of the current filter or search
9. undo instead of confirm: deleting a task, or clearing completed tasks, shows an Undo bar for a few seconds; Undo puts the tasks back where they were
10. search: a box that filters the list by text (case-insensitive); it combines with the filter

Technology
- Plain HTML, CSS and JavaScript. No framework, no build step, no server.
- Tasks and the theme choice are saved in the browser's localStorage. The filter and search text are not saved.
- Run it by opening index.html in a browser.

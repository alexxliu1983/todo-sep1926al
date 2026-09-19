# To-Do App - UI/UX Improvements Testing Guide

## ✅ Feature 1: Keyboard Shortcuts

### Test Case 1.1: Ctrl+K to Focus Search
1. Open the app
2. Press **Ctrl+K** (or **Cmd+K** on Mac)
3. **Expected:** Search input is focused and selected (text highlighted in blue)
4. Start typing to filter tasks by text

### Test Case 1.2: Numbers 1-3 to Change Priority
1. Add a task first (or use an existing one)
2. Press **1** → Task changes to **High** priority (red)
3. Press **2** → Task changes to **Medium** priority (orange)
4. Press **3** → Task changes to **Low** priority (green)
5. **Expected:** The priority changes immediately and is saved

### Test Case 1.3: Ctrl+Enter to Add Task
1. Click on the "Add a task..." input
2. Type: "Quick task via shortcut"
3. Press **Ctrl+Enter** (or **Cmd+Enter** on Mac)
4. **Expected:** Task is added to the list, input is cleared

### Test Case 1.4: Escape to Focus Input
1. Click on the search box or anywhere else
2. Press **Escape**
3. **Expected:** Focus moves to the main task input field

---

## ✅ Feature 2: Smooth Animations & Polish

### Test Case 2.1: Task Slide-In Animation
1. Add a new task by clicking "Add"
2. **Expected:** Task fades in from the left with a smooth 0.3s animation
3. Try adding several tasks quickly to see the staggered animation effect

### Test Case 2.2: Checkbox Pop Animation
1. Add a task
2. Click the checkbox to mark it as done
3. **Expected:** Checkbox bounces/scales up slightly (0.4s animation) then returns to normal
4. Text becomes strikethrough with smooth color transition

### Test Case 2.3: Undo Bar Slide-Up Animation
1. Add a task
2. Click the "Delete" button next to it
3. **Expected:** Undo notification slides up from the bottom with smooth animation
4. Click "Undo" to restore the task

### Test Case 2.4: Smooth Color Transitions
1. Toggle dark mode by clicking the 🌙/☀️ button
2. **Expected:** Background and text colors fade in smoothly (0.3s transition)
3. Priority colors update smoothly when changed

---

## ✅ Feature 3: Due Dates with Smart Sorting

### Test Case 3.1: Add Task with Today's Date
1. Click in the date input (it shows "dd/mm/yyyy" placeholder)
2. Enter today's date
3. Add the task
4. **Expected:** Task appears with an orange "Sep 19" badge labeled "Today"

### Test Case 3.2: Add Task with Future Date (Within 7 Days)
1. Add a new task with a date 3 days from today
2. **Expected:** Task shows a green date badge labeled "Upcoming"

### Test Case 3.3: Add Task with Far Future Date (>7 Days)
1. Add a new task dated 30 days from today
2. **Expected:** Task shows a gray date badge with no special styling (labeled "Later")
3. The task appears lower in the list (below overdue/today/upcoming)

### Test Case 3.4: Overdue Task Indication
1. Manually edit localStorage to add a task with a date from yesterday:
   ```javascript
   // In browser console:
   localStorage.clear(); // Clear test data
   // Or use Inspector to modify the stored task date
   ```
2. Or wait until tomorrow and see how today's task appears as overdue
3. **Expected:** Task shows a red "Sep 19" badge labeled "Overdue"

### Test Case 3.5: Smart Sorting
1. Add multiple tasks with different dates:
   - Yesterday's date → Red (Overdue)
   - Today's date → Orange (Today)
   - 2 days from now → Green (Upcoming)
   - 15 days from now → Gray (Later)
   - No date → Gray (None)
2. **Expected:** Tasks sort in this order automatically:
   ```
   1. Overdue tasks (red)
   2. Today's tasks (orange)  
   3. Upcoming tasks within 7 days (green)
   4. Later tasks (gray)
   5. Tasks without dates (gray)
   ```
   Within each group, they sort by priority (High → Medium → Low)

### Test Case 3.6: Task Persistence
1. Add a task with a due date
2. Refresh the page (F5)
3. **Expected:** Task and its due date are still there (saved in localStorage)

---

## 🎬 Visual Effect Checklist

| Feature | Visual Effect | Duration | Status |
|---------|-------------|----------|--------|
| New Task | Slides in from left, fades in | 0.3s | ✅ |
| Checkbox Check | Bounces/scales up | 0.4s | ✅ |
| Done Text | Strikethrough + fade | 0.2s | ✅ |
| Undo Bar | Slides up from bottom | 0.3s | ✅ |
| Theme Toggle | Background/text fade | 0.3s | ✅ |
| Priority Change | Smooth color transition | 0.2s | ✅ |

---

## 📱 Mobile Testing

1. Try the keyboard shortcuts on mobile (may not work as expected due to OS limitations)
2. Verify the date picker opens the native mobile date selector
3. Check that animations still work smoothly on lower-end devices
4. Test touch interactions with checkboxes and buttons

---

## 🐛 Edge Cases to Test

1. **Empty list:** Add and delete all tasks → Shows "No tasks yet. Add one above."
2. **Search:** Type to filter → Due date sorting still applies within results
3. **Filter by Active/Done:** Switching filters → Sorting order preserved
4. **Undo after multiple deletes:** Delete 3 tasks, click Undo → All 3 restore
5. **Date boundary:** Add task for exactly 7 days out → Shows as "Upcoming"
6. **Priority change via keyboard:** Press 1 on overdue task → Verify it updates correctly

---

## 🎯 Success Criteria

- [ ] All keyboard shortcuts work as documented
- [ ] Animations are smooth and not jarring
- [ ] Due dates display with correct color coding
- [ ] Tasks sort by due date status then priority
- [ ] Changes persist after page refresh
- [ ] App works on both light and dark themes
- [ ] Mobile date picker works correctly
- [ ] Undo functionality works with due dates

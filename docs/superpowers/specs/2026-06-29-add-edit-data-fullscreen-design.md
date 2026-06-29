# Design: Add/Edit Data — Full-Screen Page

**Date:** 2026-06-29
**Status:** Approved

## Problem

The add/edit measurement form is currently a bottom-sheet `Modal`. The user wants it to be a dedicated full-screen page instead, with navigation back to the data home after saving.

## Solution

Convert `AddDataModal` into a Stack screen using expo-router. FAB buttons navigate to the new screen via `router.push`. Saving or cancelling calls `router.back()`.

## Files Changed

| File | Change |
|------|--------|
| `app/add-data.tsx` | **Create** — new full-screen form page |
| `app/_layout.tsx` | **Modify** — register `add-data` screen in Stack |
| `app/(tabs)/index.tsx` | **Modify** — replace modal state + `<AddDataModal>` with `router.push` calls |
| `src/components/AddDataModal.tsx` | **Delete** — logic moved into new screen |

## New Screen: `app/add-data.tsx`

### Route params (via `useLocalSearchParams`)
- `mode`: `"add"` | `"edit"`
- `date`: ISO date string e.g. `"2026-06-29"`

### Layout
- `SafeAreaView` full-screen, white background
- `KeyboardAvoidingView` wrapping the scroll area
- Header row: 取消 (grey, `router.back()`) / centred title / 儲存 (theme colour)
- `ScrollView` with all existing form sections (基本資料 / 身體尺寸 / 身體組成)

### Data flow
- On mount: if `mode === "edit"`, load measurement for `date` via `useMeasurements`
- On 取消: `router.back()` — no save
- On 儲存: validate weight → save via `saveMeasurement` → `router.back()`
- On returning to index.tsx: `useEffect([dateKey])` re-runs `loadMeasurement` automatically — no extra wiring needed

## _layout.tsx Change

Add inside `<Stack>`:
```tsx
<Stack.Screen name="add-data" options={{ headerShown: false }} />
```

## index.tsx Changes

Remove:
- `showAddModal` state
- `modalMode` state
- `<AddDataModal>` component render
- `AddDataModal` import

Add:
- `router` from `expo-router`
- FAB `+` → `router.push(\`/add-data?mode=add&date=${dateKey}\`)`
- FAB pencil → `router.push(\`/add-data?mode=edit&date=${dateKey}\`)`

## Visual Style

Identical to the existing Modal header (same font sizes, colours, spacing). Transition animation: default Stack slide-from-right.

## Testing

1. Tap `+` FAB → full screen slides in titled "新增數據", all fields empty (except pre-filled 基本資料)
2. Fill weight, tap 儲存 → returns to data page, new weight shown
3. Tap pencil FAB → full screen slides in titled "修改數據", fields pre-filled
4. Edit a field, tap 儲存 → returns to data page, updated value shown
5. Tap 取消 → returns to data page, no changes saved
6. Leave weight blank, tap 儲存 → Alert shown, stays on page



## Fix: Logo Not Navigating to Homepage

### Problem
Clicking the logo from the dashboard (and potentially other pages) does not navigate to the homepage. The user must refresh the page manually.

### Root Cause
Two interconnected issues:

1. **LoadingBar monkey-patching breaks React Router navigation**: The `LoadingBar` component overrides `window.history.pushState` and `window.history.replaceState` with wrappers that call `setIsLoading(true)` synchronously. React Router v7 uses these browser APIs internally for navigation. The synchronous state update during navigation can block or interfere with React Router's route transition -- particularly when moving between a layout route (dashboard inside ProtectedRoute/AuthenticatedLayout) and a standalone route (homepage).

2. **Logo uses a `<div>` with `onClick` instead of a `<Link>`**: Programmatic `navigate("/")` via `onClick` is more fragile than React Router's `<Link>` component, which handles navigation through its own internal pipeline.

### Solution

**Step 1: Fix the Logo (Navigation.tsx)**
- Replace the `<div onClick={() => handleNavigate("/")}>` wrapper around the logo with a React Router `<Link to="/">` component
- This is the standard, most reliable way to handle navigation in React Router
- Import `Link` from `react-router-dom`

**Step 2: Fix the LoadingBar (LoadingBar.tsx)**
- Remove the dangerous `history.pushState` and `history.replaceState` monkey-patching entirely
- Replace with React Router's built-in `useNavigation()` hook, which safely tracks navigation state without interfering with the router's internals
- The component already imports `useNavigation` but doesn't use it for the actual loading detection

### Technical Details

**Navigation.tsx changes:**
- Import `Link` from `react-router-dom`
- Replace lines 425-434 (the logo `<div>` wrapper) with a `<Link to="/" className="cursor-pointer flex-shrink-0">` wrapper
- Keep the same `<img>` tag inside

**LoadingBar.tsx changes:**
- Use `useNavigation()` hook's `state` property (returns `"idle"`, `"loading"`, or `"submitting"`) to determine loading state
- Remove the `useEffect` that patches `pushState`/`replaceState` -- this eliminates the interference with React Router
- Simpler, cleaner, and follows React Router v7 best practices

### Files to Modify
- `src/components/Navigation.tsx` -- Logo wrapper change (2 lines)
- `src/components/LoadingBar.tsx` -- Replace monkey-patching with proper hook usage


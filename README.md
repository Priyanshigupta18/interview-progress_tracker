# Interview Practice Tracker

A responsive dashboard to track weekly interview preparation: DSA problems, Git and technical questions, and machine-coding status. Built with plain HTML, CSS and JavaScript (no frameworks, no build step).

**Live demo:** _add your deployed link here_
**Demo video:** _add your 1–2 minute video link here_

## Features

- **Dashboard:** total questions, completed DSA problems, completed interview questions (Git + Technical), and a machine-coding status selector.
- **Question tracker:** add questions with category (DSA / Git / Technical), difficulty (Easy / Medium / Hard) and status (Pending / In Progress / Completed). Change status or delete from the list.
- **Search + filters:** search by text and filter by category, status and difficulty (all combinable).
- **Progress:** completion percentage bar based on stored questions, plus a "completed this week" count.
- **Persistence:** everything is saved in LocalStorage and survives a refresh.
- **Responsive UI:** 4-column dashboard on desktop, 2 columns on tablet, single column on mobile.
- **States:** empty state, no-search-results state (with a Clear filters button), and inline form validation.

## Setup

No installs needed.

1. Clone the repo: `git clone <your-repo-url>`
2. Open the folder and double-click `index.html`, or serve it with any static server, e.g. `npx serve .`

## Deploy (GitHub Pages)

1. Push the project to a GitHub repo.
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. Save, wait a minute, and your live link appears at `https://<username>.github.io/<repo-name>/`.

## Project structure

```
index.html   page structure (dashboard, form, filters, list)
styles.css   layout, theme variables, responsive breakpoints
storage.js   small LocalStorage wrapper with error handling
app.js       state, validation, filtering, rendering, events
```

## How the code works

- **One state, one render:** `questions` (array) and `machineStatus` are the source of truth. Every action (add, update, delete) changes state, saves to LocalStorage, then calls `render()`.
- **Filtering is derived:** `getFilteredQuestions()` computes the visible list from state + filters; nothing filtered is stored.
- **Safe rendering:** list items are built with `createElement` and `textContent`, so user input is never inserted as HTML.
- **Progress** = completed ÷ total × 100, rounded.

## Assumptions

- "Interview questions completed" means completed Git + Technical questions; DSA is counted separately.
- Machine-coding status is a single tracker (Not Started / In Progress / Completed), not a per-question item.
- Progress counts all stored questions, regardless of the active filters.
- A "week" starts on Monday; "completed this week" uses the time a question was marked Completed.
- Duplicate questions (same title and category) are blocked.
- Data lives only in the current browser; there is no backend or login.

## AI usage

AI was used as a learning assistant for ideas and structure. I reviewed and understand the final code and can explain it.

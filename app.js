(function () {
  "use strict";

  // ---------- Constants ----------
  const QUESTIONS_KEY = "ipt.questions.v1";
  const MACHINE_KEY = "ipt.machineCoding.v1";
  const MACHINE_STATUSES = ["Not Started", "In Progress", "Completed"];
  const STATUSES = ["Pending", "In Progress", "Completed"];

  // ---------- State ----------
  // Single source of truth. Every change updates state -> saves -> re-renders.
  const savedQuestions = Store.load(QUESTIONS_KEY, []);
  let questions = Array.isArray(savedQuestions) ? savedQuestions : [];

  const savedMachine = Store.load(MACHINE_KEY, "Not Started");
  let machineStatus = MACHINE_STATUSES.includes(savedMachine) ? savedMachine : "Not Started";

  const filters = { search: "", category: "all", status: "all", difficulty: "all" };

  // ---------- DOM refs ----------
  const $ = (id) => document.getElementById(id);
  const dom = {
    statTotal: $("statTotal"),
    statDsa: $("statDsa"),
    statInterview: $("statInterview"),
    machineStatus: $("machineStatus"),
    progressText: $("progressText"),
    progressBar: $("progressBar"),
    progressFill: $("progressFill"),
    progressDetail: $("progressDetail"),
    form: $("questionForm"),
    title: $("title"),
    category: $("category"),
    difficulty: $("difficulty"),
    status: $("status"),
    search: $("search"),
    filterCategory: $("filterCategory"),
    filterStatus: $("filterStatus"),
    filterDifficulty: $("filterDifficulty"),
    resultCount: $("resultCount"),
    list: $("questionList"),
    emptyState: $("emptyState"),
    noResults: $("noResults"),
    clearFilters: $("clearFilters"),
  };

  // ---------- Helpers ----------
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Small helper so render code stays readable.
  // Uses textContent (not innerHTML) so user input can never inject HTML.
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function startOfThisWeek() {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.getTime();
  }

  function persist() {
    Store.save(QUESTIONS_KEY, questions);
  }

  // ---------- Data actions ----------
  function addQuestion(data) {
    questions.unshift({
      id: uid(),
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      status: data.status,
      createdAt: Date.now(),
      completedAt: data.status === "Completed" ? Date.now() : null,
    });
    persist();
    render();
  }

  function updateStatus(id, status) {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    q.status = status;
    q.completedAt = status === "Completed" ? Date.now() : null;
    persist();
    render();
  }

  function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return;
    questions = questions.filter((item) => item.id !== id);
    persist();
    render();
  }

  // ---------- Derived data ----------
  function getFilteredQuestions() {
    const term = filters.search.trim().toLowerCase();
    return questions.filter((q) => {
      const matchesSearch = !term || q.title.toLowerCase().includes(term);
      const matchesCategory = filters.category === "all" || q.category === filters.category;
      const matchesStatus = filters.status === "all" || q.status === filters.status;
      const matchesDifficulty = filters.difficulty === "all" || q.difficulty === filters.difficulty;
      return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
    });
  }

  function getStats() {
    const completed = questions.filter((q) => q.status === "Completed");
    const weekStart = startOfThisWeek();
    return {
      total: questions.length,
      completed: completed.length,
      dsaDone: completed.filter((q) => q.category === "DSA").length,
      interviewDone: completed.filter((q) => q.category !== "DSA").length,
      doneThisWeek: completed.filter((q) => q.completedAt && q.completedAt >= weekStart).length,
    };
  }

  // ---------- Rendering ----------
  function renderDashboard() {
    const s = getStats();
    dom.statTotal.textContent = s.total;
    dom.statDsa.textContent = s.dsaDone;
    dom.statInterview.textContent = s.interviewDone;
    dom.machineStatus.value = machineStatus;

    const percent = s.total === 0 ? 0 : Math.round((s.completed / s.total) * 100);
    dom.progressText.textContent = percent + "%";
    dom.progressFill.style.width = percent + "%";
    dom.progressBar.setAttribute("aria-valuenow", percent);

    dom.progressDetail.textContent =
      s.total === 0
        ? "No questions yet."
        : `${s.completed} of ${s.total} completed · ${s.doneThisWeek} completed this week`;
  }

  function buildQuestionItem(q) {
    const li = el("li", "card question-item" + (q.status === "Completed" ? " done" : ""));

    const main = el("div", "question-main");
    main.appendChild(el("p", "question-title", q.title));
    const badges = el("div", "badges");
    badges.appendChild(el("span", "badge", q.category));
    badges.appendChild(el("span", "badge " + q.difficulty, q.difficulty));
    main.appendChild(badges);

    const actions = el("div", "question-actions");

    const select = el("select");
    select.setAttribute("aria-label", "Status for " + q.title);
    STATUSES.forEach((s) => {
      const opt = el("option", "", s);
      opt.value = s;
      select.appendChild(opt);
    });
    select.value = q.status;
    select.addEventListener("change", () => updateStatus(q.id, select.value));

    const del = el("button", "btn btn-delete", "Delete");
    del.type = "button";
    del.addEventListener("click", () => deleteQuestion(q.id));

    actions.append(select, del);
    li.append(main, actions);
    return li;
  }

  function renderList() {
    const visible = getFilteredQuestions();
    dom.list.innerHTML = "";

    const noData = questions.length === 0;
    const noMatches = !noData && visible.length === 0;

    dom.emptyState.hidden = !noData;
    dom.noResults.hidden = !noMatches;
    dom.resultCount.textContent = noData ? "" : `Showing ${visible.length} of ${questions.length}`;

    visible.forEach((q) => dom.list.appendChild(buildQuestionItem(q)));
  }

  function render() {
    renderDashboard();
    renderList();
  }

  // ---------- Form validation ----------
  function setError(field, message) {
    $(field + "Error").textContent = message;
    dom[field].classList.toggle("invalid", Boolean(message));
  }

  function validateForm() {
    const title = dom.title.value.trim();
    let valid = true;

    if (title.length < 3) {
      setError("title", "Enter at least 3 characters.");
      valid = false;
    } else if (
      questions.some((q) => q.title.toLowerCase() === title.toLowerCase() && q.category === dom.category.value)
    ) {
      setError("title", "This question is already in that category.");
      valid = false;
    } else {
      setError("title", "");
    }

    if (!dom.category.value) {
      setError("category", "Choose a category.");
      valid = false;
    } else {
      setError("category", "");
    }

    if (!dom.difficulty.value) {
      setError("difficulty", "Choose a difficulty.");
      valid = false;
    } else {
      setError("difficulty", "");
    }

    return valid;
  }

  // ---------- Events ----------
  dom.form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    addQuestion({
      title: dom.title.value.trim(),
      category: dom.category.value,
      difficulty: dom.difficulty.value,
      status: dom.status.value,
    });

    dom.form.reset();
    dom.title.focus();
  });

  // Clear an error as soon as the user starts fixing the field.
  ["title", "category", "difficulty"].forEach((field) => {
    dom[field].addEventListener("input", () => setError(field, ""));
  });

  dom.search.addEventListener("input", () => {
    filters.search = dom.search.value;
    renderList();
  });
  dom.filterCategory.addEventListener("change", () => {
    filters.category = dom.filterCategory.value;
    renderList();
  });
  dom.filterStatus.addEventListener("change", () => {
    filters.status = dom.filterStatus.value;
    renderList();
  });
  dom.filterDifficulty.addEventListener("change", () => {
    filters.difficulty = dom.filterDifficulty.value;
    renderList();
  });

  dom.clearFilters.addEventListener("click", () => {
    filters.search = "";
    filters.category = filters.status = filters.difficulty = "all";
    dom.search.value = "";
    dom.filterCategory.value = dom.filterStatus.value = dom.filterDifficulty.value = "all";
    renderList();
  });

  dom.machineStatus.addEventListener("change", () => {
    machineStatus = dom.machineStatus.value;
    Store.save(MACHINE_KEY, machineStatus);
  });

  // ---------- Init ----------
  MACHINE_STATUSES.forEach((s) => {
    const opt = el("option", "", s);
    opt.value = s;
    dom.machineStatus.appendChild(opt);
  });

  render();
})();

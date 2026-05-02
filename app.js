const reasons = [
  "There are songs you have not heard yet.",
  "Someone will be glad you stayed.",
  "Your future self deserves the chance to meet you.",
  "There are ordinary mornings that will feel peaceful again.",
  "You are allowed to begin again as many times as needed.",
  "A small step still counts as movement.",
  "You do not need to solve your whole life tonight.",
  "There is still kindness you have not received yet."
];

const prompts = [
  "Name five things you can see.",
  "Put both feet on the floor and notice the ground holding you.",
  "Drink a glass of water slowly.",
  "Text one safe person: “Can you stay with me for a bit?”",
  "Find one sound nearby and follow it for ten breaths.",
  "Loosen your jaw, lower your shoulders, unclench your hands.",
  "Step outside or open a window for one minute.",
  "Pick the smallest useful task and do only that."
];

const checklistItems = [
  "Drink water",
  "Eat something simple",
  "Take medication if prescribed",
  "Message one person",
  "Rest without earning it"
];

const breathingCueIntervalMs = 4000;
const maxSavedReasons = 12;

const storageKeys = {
  reasons: "will-to-live-reasons",
  checklist: "will-to-live-checklist"
};

const reasonButton = document.querySelector("#reasonButton");
const reasonText = document.querySelector("#reason");
const promptButton = document.querySelector("#promptButton");
const groundingPrompt = document.querySelector("#groundingPrompt");
const breathingCue = document.querySelector("#breathingCue");
const reasonForm = document.querySelector("#reasonForm");
const customReason = document.querySelector("#customReason");
const savedReasons = document.querySelector("#savedReasons");
const checklist = document.querySelector("#checklist");

let previousReason = reasonText.textContent.trim();
let previousPrompt = groundingPrompt.textContent.trim();

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function chooseDifferent(items, previous) {
  const available = items.filter((item) => item !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? items[0];
}

function renderSavedReasons() {
  const personalReasons = loadJson(storageKeys.reasons, []);
  savedReasons.replaceChildren();

  if (personalReasons.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Start with one small reason. It is enough.";
    savedReasons.append(empty);
    return;
  }

  personalReasons.forEach((personalReason, index) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const remove = document.createElement("button");

    text.textContent = personalReason;
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const latestReasons = loadJson(storageKeys.reasons, []);
      latestReasons.splice(index, 1);
      saveJson(storageKeys.reasons, latestReasons);
      renderSavedReasons();
    });

    item.append(text, remove);
    savedReasons.append(item);
  });
}

function renderChecklist() {
  const savedChecklist = loadJson(storageKeys.checklist, {});
  checklist.replaceChildren();

  checklistItems.forEach((item) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const text = document.createElement("span");

    checkbox.type = "checkbox";
    checkbox.checked = Boolean(savedChecklist[item]);
    checkbox.addEventListener("change", () => {
      savedChecklist[item] = checkbox.checked;
      saveJson(storageKeys.checklist, savedChecklist);
    });
    text.textContent = item;

    label.append(checkbox, text);
    checklist.append(label);
  });
}

reasonButton.addEventListener("click", () => {
  previousReason = chooseDifferent(reasons, previousReason);
  reasonText.textContent = previousReason;
});

promptButton.addEventListener("click", () => {
  previousPrompt = chooseDifferent(prompts, previousPrompt);
  groundingPrompt.textContent = previousPrompt;
});

reasonForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = customReason.value.trim();
  if (!value) {
    return;
  }

  const personalReasons = loadJson(storageKeys.reasons, []);
  personalReasons.unshift(value);
  saveJson(storageKeys.reasons, personalReasons.slice(0, maxSavedReasons));
  reasonForm.reset();
  renderSavedReasons();
});

setInterval(() => {
  breathingCue.textContent = breathingCue.textContent === "Inhale" ? "Exhale" : "Inhale";
}, breathingCueIntervalMs);

renderSavedReasons();
renderChecklist();

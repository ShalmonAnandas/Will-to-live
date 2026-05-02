const reasons = [
  "There are songs you have not heard yet.",
  "Someone will be glad you stayed.",
  "Your future self deserves the chance to meet you.",
  "There are ordinary mornings that will feel peaceful again.",
  "You are allowed to begin again as many times as needed.",
  "A small step still counts as movement.",
  "You do not need to solve your whole life tonight.",
  "There is still kindness you have not received yet.",
  "Some future day will be softer because you made it here.",
  "There are people who would miss your exact laugh.",
  "You can rest first and decide anything else later.",
  "The next safe moment can be enough for now."
];

const prompts = [
  "Name five things you can see.",
  "Put both feet on the floor and notice the ground holding you.",
  "Drink a glass of water slowly.",
  "Text one safe person: “Can you stay with me for a bit?”",
  "Find one sound nearby and follow it for ten breaths.",
  "Loosen your jaw, lower your shoulders, unclench your hands.",
  "Step outside or open a window for one minute.",
  "Pick the smallest useful task and do only that.",
  "Hold something cool and describe its texture to yourself.",
  "Count backward from twenty with one slow breath between each number.",
  "Look for one color in the room and find three places it appears."
];

const exercises = [
  "Press each fingertip to your thumb and name one thing that is still okay.",
  "Trace a square in the air: inhale up, hold across, exhale down, rest across.",
  "Place a hand on your chest and feel three slow breaths arrive and leave.",
  "Name one thing you can postpone until tomorrow.",
  "Stretch your hands wide, then let them soften in your lap.",
  "Choose a comforting object nearby and notice its weight for thirty seconds.",
  "Write or whisper: “I only have to get through this minute.”",
  "Relax your forehead, tongue, shoulders, stomach, and toes one by one."
];

const checklistItems = [
  "Drink water",
  "Eat something simple",
  "Take medication if prescribed",
  "Message one person",
  "Rest without earning it",
  "Step into fresh air",
  "Wash your face or hands"
];

// The cue changes halfway through the 8s CSS breathing cycle.
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
const exerciseButton = document.querySelector("#exerciseButton");
const exercisePrompt = document.querySelector("#exercisePrompt");
const breathingCue = document.querySelector("#breathingCue");
const reasonForm = document.querySelector("#reasonForm");
const customReason = document.querySelector("#customReason");
const savedReasons = document.querySelector("#savedReasons");
const checklist = document.querySelector("#checklist");

let previousReason = reasonText.textContent.trim();
let previousPrompt = groundingPrompt.textContent.trim();
let previousExercise = exercisePrompt.textContent.trim();

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
  if (available.length === 0) {
    return previous;
  }

  return available[Math.floor(Math.random() * available.length)];
}

function refreshText(element, value) {
  element.classList.remove("is-changing");
  // Force a reflow so repeated button presses restart the gentle text animation.
  void element.offsetWidth;
  element.textContent = value;
  element.classList.add("is-changing");
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

  personalReasons.forEach((personalReason) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const remove = document.createElement("button");

    text.textContent = personalReason;
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const latestReasons = loadJson(storageKeys.reasons, []);
      const reasonIndex = latestReasons.indexOf(personalReason);
      if (reasonIndex !== -1) {
        latestReasons.splice(reasonIndex, 1);
      }
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
  refreshText(reasonText, previousReason);
});

promptButton.addEventListener("click", () => {
  previousPrompt = chooseDifferent(prompts, previousPrompt);
  refreshText(groundingPrompt, previousPrompt);
});

exerciseButton.addEventListener("click", () => {
  previousExercise = chooseDifferent(exercises, previousExercise);
  refreshText(exercisePrompt, previousExercise);
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

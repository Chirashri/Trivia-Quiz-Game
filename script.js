
const settingsEl = document.getElementById("settings");
const quizEl = document.getElementById("quiz");
const resultEl = document.getElementById("result");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const scoreDisplay = document.getElementById("score");
const questionNumber = document.getElementById("question-number");
const playerNameInput = document.getElementById("player-name");
const nameError = document.getElementById("name-error");

let questions = [];
let currentIndex = 0;
let score = 0;
let maxScore = 0;

let timer;
let timeLeft = 10;
let playerName = "";



function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function startQuiz() {
  const name = playerNameInput.value.trim();
  if (!name) {
    nameError.innerText = "Please enter your name.";
    return;
  }
  nameError.innerText = "";
  playerName = name;

  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;

  let apiUrl = `https://opentdb.com/api.php?amount=5&type=multiple`;
  if (category) apiUrl += `&category=${category}`;
  if (difficulty) apiUrl += `&difficulty=${difficulty}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    // questions = data.results;
    // currentIndex = 0;
    // score = 0;
    questions = data.results;
currentIndex = 0;
score = 0;
maxScore = 0;

// Calculate max possible score dynamically
questions.forEach((q) => {
  const diff = q.difficulty;
  maxScore += diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
});


    settingsEl.classList.add("hidden");
    resultEl.classList.add("hidden");
    quizEl.classList.remove("hidden");

    showQuestion();
  } catch (error) {
    alert("Failed to load quiz questions. Please try again.");
  }
}

function showQuestion() {
  clearInterval(timer);
  timeLeft = 10;
  updateTimer();
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft === 0) {
      clearInterval(timer);
      autoFail();
    }
  }, 1000);

  clearAnswers();
  const q = questions[currentIndex];
  questionNumber.innerText = `Question ${currentIndex + 1} of ${questions.length}`;
  questionEl.innerText = decodeHTML(q.question);
  document.getElementById("meta-info").innerText =
    `📚 ${q.category} | 🧩 ${q.difficulty.toUpperCase()}`;

  const choices = [...q.incorrect_answers, q.correct_answer]
    .map(decodeHTML)
    .sort(() => Math.random() - 0.5);

  choices.forEach((choice) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => selectAnswer(btn, decodeHTML(q.correct_answer));
    li.appendChild(btn);
    answersEl.appendChild(li);
  });
}

function selectAnswer(button, correctAnswer) {
  clearInterval(timer);
  const buttons = answersEl.querySelectorAll("button");

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.innerText === correctAnswer) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
    }
  });

  const isCorrect = button.innerText === correctAnswer;
  if (isCorrect) {
    const difficulty = questions[currentIndex].difficulty;
    const point = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    score += point;
    document.getElementById("sound-correct").play();
  } else {
    document.getElementById("sound-wrong").play();
  }

  nextBtn.classList.remove("hidden");
}

function autoFail() {
  const q = questions[currentIndex];
  const correctAnswer = decodeHTML(q.correct_answer);
  const buttons = answersEl.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.innerText === correctAnswer) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
    }
  });

  document.getElementById("sound-wrong").play();
  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    nextBtn.classList.add("hidden");
    showQuestion();
  } else {
    showScore();
  }
});

function clearAnswers() {
  answersEl.innerHTML = "";
}

function updateTimer() {
  document.getElementById("timer").innerText = `⏱️ Time Left: ${timeLeft}s`;
}

function showScore() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  settingsEl.classList.add("hidden");

  // scoreDisplay.innerText = `${score} pts`;

  scoreDisplay.innerText = `${score} / ${maxScore} pts`;


  const high = localStorage.getItem("highScore") || 0;
  if (score > high) {
    localStorage.setItem("highScore", score);
  }
  document.getElementById("high-score").innerText = localStorage.getItem("highScore");

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ name: playerName, score, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));

  showLeaderboard();
}

function showLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.forEach((entry) => {
    const li = document.createElement("li");
    li.innerText = `${entry.name} — ${entry.score} pts — ${entry.date}`;
    leaderboardList.appendChild(li);
  });
}

function restartQuiz() {
  settingsEl.classList.remove("hidden");
  quizEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  score = 0;
  currentIndex = 0;
  playerNameInput.value = "";
  nameError.innerText = "";
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});

window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  const highScore = localStorage.getItem("highScore") || 0;
  document.getElementById("high-score").innerText = highScore;
};

document.getElementById("back-to-settings-from-quiz").addEventListener("click", () => {
  clearInterval(timer);
  settingsEl.classList.remove("hidden");
  quizEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  score = 0;
  currentIndex = 0;
  playerNameInput.value = "";
  nameError.innerText = "";
});

document.getElementById("back-to-settings-from-result").addEventListener("click", () => {
  settingsEl.classList.remove("hidden");
  quizEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  score = 0;
  currentIndex = 0;
  playerNameInput.value = "";
  nameError.innerText = "";
});

document.getElementById("clear-leaderboard").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear the leaderboard?")) {
    localStorage.removeItem("leaderboard");
    showLeaderboard(); // Refresh the displayed leaderboard
  }
});

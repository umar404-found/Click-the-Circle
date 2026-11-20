document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     0. OPENING SPLASH SCREEN
  ========================================= */
  const splashScreen = document.getElementById("splashScreen");
  if (splashScreen) {
    const dismissSplash = () => splashScreen.classList.add("fade-out");
    const splashTimer = setTimeout(dismissSplash, 1050);
    splashScreen.addEventListener("click", () => {
      clearTimeout(splashTimer);
      dismissSplash();
    });
  }

  /* =========================================
     1. DOM ELEMENTS
  ========================================= */
  const gameArea = document.getElementById("game-area");
  const circle = document.getElementById("circle");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const countdownEl = document.getElementById("countdown");

  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const logoBadge = document.getElementById("logoBadge");
  const specialModeBadge = document.getElementById("specialModeBadge");
  const easterToast = document.getElementById("easterToast");

  // Sound Controls
  const soundToggle = document.getElementById("soundToggle");
  const soundOnIcon = soundToggle.querySelector(".sound-on");
  const soundOffIcon = soundToggle.querySelector(".sound-off");
  const soundLabel = document.getElementById("soundLabel");

  // Duration Controls (30s / 60s / 90s)
  const durationGroup = document.getElementById("durationGroup");
  const durationBtns = durationGroup.querySelectorAll(".seg-btn");

  // Custom Difficulty Dropdown
  const difficultySelector = document.getElementById("difficultySelector");
  const difficultyButton = document.getElementById("difficultyButton");
  const difficultyDropdown = document.getElementById("difficultyDropdown");
  const currentDiffDot = document.getElementById("currentDiffDot");
  const currentDiffLabel = document.getElementById("currentDiffLabel");
  const diffOptions = document.querySelectorAll(".diff-option");

  // HUD Stats
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const comboPill = document.getElementById("comboPill");
  const timerEl = document.getElementById("timer");
  const highScoreEl = document.getElementById("highScore");

  // Game Over Elements
  const finalScoreEl = document.getElementById("finalScore");
  const finalHighScoreEl = document.getElementById("finalHighScore");
  const avgTimeEl = document.getElementById("avgTime");
  const accuracyEl = document.getElementById("accuracy");
  const newRecordBadge = document.getElementById("newRecordBadge");

  // Leaderboard Elements
  const leaderboardForm = document.getElementById("leaderboardForm");
  const playerNameInput = document.getElementById("playerName");
  const submitScoreBtn = document.getElementById("submitScoreBtn");
  const leaderboardList = document.getElementById("leaderboardList");
  const resetLbBtn = document.getElementById("resetLbBtn");

  // Theme Elements
  const themeSelector = document.getElementById("themeSelector");
  const themeButton = document.getElementById("themeButton");
  const themeDropdown = document.getElementById("themeDropdown");
  const themeIcon = document.getElementById("themeIcon");
  const themeName = document.getElementById("themeName");
  const themeOptions = document.querySelectorAll(".theme-option");
  const themeFxLayer = document.getElementById("theme-fx-layer");

  /* =========================================
     2. WEB AUDIO SYNTHESIZER & SOUND UI
  ========================================= */
  let audioCtx = null;
  let soundEnabled = localStorage.getItem("ctc_sound") !== "false";

  const updateSoundUI = () => {
    soundToggle.classList.toggle("is-muted", !soundEnabled);
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.title = soundEnabled ? "Sound On (Click to Mute)" : "Muted (Click to Unmute)";
    soundOnIcon.classList.toggle("hidden", !soundEnabled);
    soundOffIcon.classList.toggle("hidden", soundEnabled);
    soundLabel.textContent = soundEnabled ? "SFX" : "MUTE";
  };

  const playTone = (freq, type = "sine", duration = 0.1, gainVal = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {
      // Ignore autoplay restriction
    }
  };

  const playSugarChime = () => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, "triangle", 0.16, 0.14), i * 65);
    });
  };

  updateSoundUI();

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("ctc_sound", soundEnabled);
    updateSoundUI();
    if (soundEnabled) playTone(640, "sine", 0.08, 0.12);
  });

  /* =========================================
     3. SPECIAL THEMES & PASTEL EASTER EGG
  ========================================= */
  let currentTheme = "galaxy";
  let sugarRushActive = false;
  let logoTapCount = 0;
  let logoTapTimer = null;
  let toastTimer = null;

  const showToast = (msg) => {
    easterToast.textContent = msg;
    easterToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => easterToast.classList.remove("show"), 2600);
  };

  const themeMeta = {
    light: { icon: "☀️", label: "Light" },
    dark: { icon: "🌙", label: "Dark" },
    neon: { icon: "⚡", label: "Neon" },
    pastel: { icon: "🧁", label: "Pastel" },
    galaxy: { icon: "🌌", label: "Galaxy" },
  };

  const buildThemeAmbience = (theme) => {
    themeFxLayer.innerHTML = "";
    themeFxLayer.classList.remove("warp-mode");

    if (theme === "galaxy") {
      themeFxLayer.innerHTML = `
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        <div class="shooting-star s1"></div>
        <div class="shooting-star s2"></div>
        <div class="shooting-star s3"></div>
      `;
      const starColors = ["#ffffff", "#dbeafe", "#e0e7ff", "#bae6fd", "#fef08a", "#f5d0fe"];
      for (let i = 0; i < 110; i++) {
        const star = document.createElement("span");
        star.className = "star";
        const size = Math.random() < 0.72 ? Math.random() * 1.6 + 1 : Math.random() * 2.2 + 2;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.backgroundColor = color;
        star.style.setProperty("--dur", `${(Math.random() * 3.5 + 1.8).toFixed(2)}s`);
        star.style.setProperty("--delay", `${(Math.random() * 4).toFixed(2)}s`);
        star.style.setProperty("--min-op", (Math.random() * 0.35 + 0.15).toFixed(2));
        if (size > 2.6) star.style.boxShadow = `0 0 6px ${color}`;
        themeFxLayer.appendChild(star);
      }
    } else if (theme === "neon") {
      themeFxLayer.innerHTML = `
        <div class="neon-scanlines"></div>
        <div class="neon-horizon"></div>
      `;
    } else if (theme === "pastel") {
      const icons = ["☁️", "✨", "🌸", "🍬", "💖", "⭐"];
      for (let i = 0; i < 18; i++) {
        const item = document.createElement("span");
        item.className = "pastel-float";
        item.textContent = icons[i % icons.length];
        item.style.left = `${Math.random() * 94 + 2}%`;
        item.style.top = `${Math.random() * 90 + 4}%`;
        item.style.setProperty("--size", `${(Math.random() * 0.7 + 1).toFixed(2)}rem`);
        item.style.setProperty("--dur", `${(Math.random() * 8 + 10).toFixed(1)}s`);
        item.style.setProperty("--delay", `${(-Math.random() * 8).toFixed(1)}s`);
        themeFxLayer.appendChild(item);
      }
    }
  };

  const setSugarRush = (active) => {
    sugarRushActive = active;
    specialModeBadge.classList.toggle("hidden", !active);
    circle.classList.toggle("sugar-target", active);
    circle.textContent = active ? "🧁" : "";
  };

  const applyTheme = (theme) => {
    const validTheme = themeMeta[theme] ? theme : "galaxy";
    currentTheme = validTheme;
    document.body.setAttribute("data-theme", validTheme);
    localStorage.setItem("ctc_theme", validTheme);

    themeIcon.textContent = themeMeta[validTheme].icon;
    themeName.textContent = themeMeta[validTheme].label;

    themeOptions.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === validTheme);
    });

    if (validTheme !== "pastel" && sugarRushActive) {
      setSugarRush(false);
    }

    buildThemeAmbience(validTheme);
  };

  logoBadge.addEventListener("click", () => {
    playTone(680, "sine", 0.06, 0.1);

    if (currentTheme !== "pastel") {
      showToast("💡 Psst... try tapping this 5x in Pastel theme!");
      return;
    }

    logoTapCount++;
    clearTimeout(logoTapTimer);
    logoTapTimer = setTimeout(() => {
      logoTapCount = 0;
    }, 2500);

    if (logoTapCount >= 5) {
      logoTapCount = 0;
      const nextState = !sugarRushActive;
      setSugarRush(nextState);
      if (nextState) {
        playSugarChime();
        showToast("🧁 SUGAR RUSH EASTER EGG UNLOCKED!");
      } else {
        showToast("Pastel normal mode restored!");
      }
    }
  });

  const savedTheme = localStorage.getItem("ctc_theme") || "galaxy";
  applyTheme(savedTheme);

  themeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    difficultyDropdown.classList.add("hidden");
    difficultyButton.setAttribute("aria-expanded", "false");
    const isHidden = themeDropdown.classList.toggle("hidden");
    themeButton.setAttribute("aria-expanded", String(!isHidden));
  });

  themeOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
      themeDropdown.classList.add("hidden");
      themeButton.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================================
     4. DURATION (30s/60s/90s) & CUSTOM DIFFICULTY
  ========================================= */
  const difficultyConfig = {
    easy: { size: 72, delay: 560, label: "Easy" },
    medium: { size: 56, delay: 400, label: "Medium" },
    hard: { size: 42, delay: 250, label: "Hard" },
  };

  let selectedDifficulty = localStorage.getItem("ctc_difficulty") || "medium";
  if (!difficultyConfig[selectedDifficulty]) selectedDifficulty = "medium";

  let selectedDuration = parseInt(localStorage.getItem("ctc_duration"), 10);
  if (![30, 60, 90].includes(selectedDuration)) selectedDuration = 30;

  let score = 0;
  let streak = 0;
  let multiplier = 1;
  let timeLeft = selectedDuration;
  let gameActive = false;

  const setDifficulty = (mode) => {
    if (!difficultyConfig[mode]) return;
    selectedDifficulty = mode;
    localStorage.setItem("ctc_difficulty", mode);

    currentDiffDot.className = `diff-dot ${mode}`;
    currentDiffLabel.textContent = difficultyConfig[mode].label;

    diffOptions.forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.value === mode);
    });
  };

  const setDuration = (seconds) => {
    if (![30, 60, 90].includes(seconds)) return;
    selectedDuration = seconds;
    localStorage.setItem("ctc_duration", String(seconds));

    durationBtns.forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.duration) === seconds);
    });

    if (!gameActive) {
      timeLeft = selectedDuration;
      timerEl.textContent = `${selectedDuration}s`;
    }
  };

  setDifficulty(selectedDifficulty);
  setDuration(selectedDuration);

  durationBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (gameActive) return;
      setDuration(Number(btn.dataset.duration));
      playTone(580, "sine", 0.06, 0.09);
    });
  });

  difficultyButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (difficultyButton.disabled) return;
    themeDropdown.classList.add("hidden");
    themeButton.setAttribute("aria-expanded", "false");
    const isHidden = difficultyDropdown.classList.toggle("hidden");
    difficultyButton.setAttribute("aria-expanded", String(!isHidden));
  });

  diffOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      setDifficulty(opt.dataset.value);
      difficultyDropdown.classList.add("hidden");
      difficultyButton.setAttribute("aria-expanded", "false");
      playTone(620, "sine", 0.06, 0.09);
    });
  });

  document.addEventListener("click", (e) => {
    if (!themeSelector.contains(e.target)) {
      themeDropdown.classList.add("hidden");
      themeButton.setAttribute("aria-expanded", "false");
    }
    if (!difficultySelector.contains(e.target)) {
      difficultyDropdown.classList.add("hidden");
      difficultyButton.setAttribute("aria-expanded", "false");
    }
  });

  /* =========================================
     5. GAME STATE & VISUAL FX
  ========================================= */
  let timerInterval = null;
  let countdownInterval = null;
  let spawnTimeout = null;

  let lastSpawnTime = 0;
  let totalReactionTime = 0;
  let hits = 0;
  let totalClicks = 0;

  let highScore = parseInt(localStorage.getItem("ctc_highScore"), 10) || 0;
  let leaderboard = JSON.parse(localStorage.getItem("ctc_leaderboard")) || [];
  highScoreEl.textContent = highScore;

  const setControlsLocked = (locked) => {
    difficultyButton.disabled = locked;
    difficultyDropdown.classList.add("hidden");
    difficultyButton.setAttribute("aria-expanded", "false");
    durationGroup.classList.toggle("disabled", locked);
  };

  const spawnConfetti = (x, y) => {
    const treats = ["🧁", "💖", "⭐", "🍬", "✨", "🍓"];
    for (let i = 0; i < 8; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = treats[i % treats.length];

      const angle = (Math.PI * 2 * i) / 8 + (Math.random() * 0.4 - 0.2);
      const dist = 42 + Math.random() * 38;
      const tx = `${Math.round(Math.cos(angle) * dist)}px`;
      const ty = `${Math.round(Math.sin(angle) * dist)}px`;
      const rot = `${Math.round(Math.random() * 240 - 120)}deg`;

      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.setProperty("--tx", tx);
      piece.style.setProperty("--ty", ty);
      piece.style.setProperty("--rot", rot);

      gameArea.appendChild(piece);
      setTimeout(() => piece.remove(), 760);
    }
  };

  const spawnFeedback = (x, y, text, isMiss = false) => {
    const ripple = document.createElement("span");
    ripple.className = isMiss ? "ripple miss" : "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    gameArea.appendChild(ripple);
    setTimeout(() => ripple.remove(), 460);

    const label = document.createElement("span");
    label.className = isMiss ? "float-text miss" : "float-text";
    label.textContent = text;
    label.style.left = `${x}px`;
    label.style.top = `${y - 12}px`;
    gameArea.appendChild(label);
    setTimeout(() => label.remove(), 660);
  };

  const updateComboUI = () => {
    if (streak >= 10) multiplier = 4;
    else if (streak >= 6) multiplier = 3;
    else if (streak >= 3) multiplier = 2;
    else multiplier = 1;

    comboEl.textContent = `${multiplier}x`;
    comboPill.classList.toggle("hot", multiplier >= 2);

    if (currentTheme === "galaxy") {
      themeFxLayer.classList.toggle("warp-mode", multiplier === 4);
    }
  };

  /* =========================================
     6. CORE GAME LOOP
  ========================================= */
  const moveCircle = () => {
    const { size } = difficultyConfig[selectedDifficulty];
    const padding = size / 2 + 12;
    const maxX = Math.max(padding + 10, gameArea.clientWidth - padding);
    const maxY = Math.max(padding + 10, gameArea.clientHeight - padding);

    const x = Math.random() * (maxX - padding) + padding;
    const y = Math.random() * (maxY - padding) + padding;

    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.toggle("sugar-target", sugarRushActive);
    circle.textContent = sugarRushActive ? "🧁" : "";
    circle.classList.remove("hidden");

    lastSpawnTime = performance.now();
  };

  const startCountdown = () => {
    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    clearTimeout(spawnTimeout);

    score = 0;
    streak = 0;
    multiplier = 1;
    timeLeft = selectedDuration;
    totalReactionTime = 0;
    hits = 0;
    totalClicks = 0;
    gameActive = false;

    scoreEl.textContent = "0";
    timerEl.textContent = `${selectedDuration}s`;
    updateComboUI();

    setControlsLocked(true);
    startOverlay.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    circle.classList.add("hidden");

    let count = 3;
    countdownEl.textContent = count;
    countdownEl.classList.remove("hidden");
    playTone(440, "triangle", 0.12, 0.14);

    countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
        playTone(440, "triangle", 0.12, 0.14);
      } else {
        clearInterval(countdownInterval);
        countdownEl.classList.add("hidden");
        playTone(740, "triangle", 0.18, 0.18);
        beginRound();
      }
    }, 850);
  };

  const beginRound = () => {
    gameActive = true;
    moveCircle();

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 5 && timeLeft > 0) {
        playTone(520, "sine", 0.08, 0.1);
      }
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  };

  const endGame = () => {
    gameActive = false;
    clearInterval(timerInterval);
    clearTimeout(spawnTimeout);
    circle.classList.add("hidden");
    setControlsLocked(false);
    themeFxLayer.classList.remove("warp-mode");

    playTone(300, "sawtooth", 0.28, 0.14);

    const isNewRecord = score > highScore && score > 0;
    if (isNewRecord) {
      highScore = score;
      localStorage.setItem("ctc_highScore", highScore);
      highScoreEl.textContent = highScore;
    }

    const avgReaction = hits > 0 ? Math.round(totalReactionTime / hits) : 0;
    const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

    finalScoreEl.textContent = score;
    finalHighScoreEl.textContent = highScore;
    avgTimeEl.textContent = avgReaction;
    accuracyEl.textContent = accuracy;
    newRecordBadge.classList.toggle("hidden", !isNewRecord);

    playerNameInput.value = "";
    submitScoreBtn.disabled = false;
    submitScoreBtn.textContent = "Save Score";
    gameOverScreen.classList.remove("hidden");
  };

  /* =========================================
     7. POINTER EVENTS (HIT & MISS)
  ========================================= */
  circle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    if (!gameActive) return;

    const reaction = Math.max(1, Math.round(performance.now() - lastSpawnTime));
    totalReactionTime += reaction;
    hits++;
    totalClicks++;
    streak++;
    updateComboUI();

    const pointsEarned = 1 * multiplier;
    score += pointsEarned;
    scoreEl.textContent = score;

    const rect = gameArea.getBoundingClientRect();
    const hitX = e.clientX - rect.left;
    const hitY = e.clientY - rect.top;

    if (sugarRushActive) {
      const chiptuneScale = [587.33, 659.25, 783.99, 880, 1046.5];
      playTone(chiptuneScale[streak % chiptuneScale.length], "triangle", 0.12, 0.16);
      spawnConfetti(hitX, hitY);
    } else if (currentTheme === "neon" && reaction < 300) {
      playTone(620 + multiplier * 110, "square", 0.08, 0.12);
      gameArea.classList.add("cyber-surge");
      setTimeout(() => gameArea.classList.remove("cyber-surge"), 180);
    } else {
      playTone(520 + multiplier * 95, "sine", 0.09, 0.16);
    }

    spawnFeedback(hitX, hitY, `+${pointsEarned} · ${reaction}ms`, false);

    circle.classList.add("hidden");
    clearTimeout(spawnTimeout);
    const { delay } = difficultyConfig[selectedDifficulty];
    spawnTimeout = setTimeout(() => {
      if (gameActive) moveCircle();
    }, delay);
  });

  gameArea.addEventListener("pointerdown", (e) => {
    if (!gameActive || e.target === circle) return;

    totalClicks++;
    streak = 0;
    updateComboUI();
    playTone(170, "sawtooth", 0.11, 0.1);

    const rect = gameArea.getBoundingClientRect();
    spawnFeedback(e.clientX - rect.left, e.clientY - rect.top, "MISS", true);
  });

  startButton.addEventListener("click", startCountdown);
  restartButton.addEventListener("click", startCountdown);

  /* =========================================
     8. TOP 5 LEADERBOARD
  ========================================= */
  const renderLeaderboard = () => {
    leaderboardList.innerHTML = "";
    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = `<li class="lb-empty">No scores yet. Be the first!</li>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    leaderboard.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.className = "lb-item";
      const rankBadge = medals[idx] || `#${idx + 1}`;
      const durationBadge = entry.duration ? ` · ${entry.duration}s` : "";
      li.innerHTML = `
        <div class="lb-left">
          <span class="lb-rank">${rankBadge}</span>
          <div>
            <span class="lb-name"></span>
            <span class="lb-meta">${entry.mode}${durationBadge} · ${entry.avgMs}ms</span>
          </div>
        </div>
        <span class="lb-score">${entry.score} pts</span>
      `;
      li.querySelector(".lb-name").textContent = entry.name;
      leaderboardList.appendChild(li);
    });
  };

  leaderboardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (submitScoreBtn.disabled) return;

    const name = playerNameInput.value.trim() || "Player";
    const avgMs = hits > 0 ? Math.round(totalReactionTime / hits) : 0;
    const mode = difficultyConfig[selectedDifficulty].label;

    leaderboard.push({ name, score, mode, duration: selectedDuration, avgMs });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem("ctc_leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();

    submitScoreBtn.disabled = true;
    submitScoreBtn.textContent = "Saved ✓";
  });

  let confirmReset = false;
  let resetTimer = null;

  resetLbBtn.addEventListener("click", () => {
    if (!confirmReset) {
      confirmReset = true;
      resetLbBtn.textContent = "Confirm?";
      resetTimer = setTimeout(() => {
        confirmReset = false;
        resetLbBtn.textContent = "Reset";
      }, 2500);
    } else {
      clearTimeout(resetTimer);
      confirmReset = false;
      resetLbBtn.textContent = "Reset";
      leaderboard = [];
      localStorage.removeItem("ctc_leaderboard");
      renderLeaderboard();
    }
  });

  renderLeaderboard();
});
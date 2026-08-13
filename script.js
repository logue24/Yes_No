(() => {
  'use strict';

  const mainButton = document.getElementById('mainButton');
  const btnLabel = document.getElementById('btnLabel');
  const questionInput = document.getElementById('questionInput');
  const resultZone = document.getElementById('resultZone');
  const stamp = document.getElementById('stamp');
  const stampText = document.getElementById('stampText');
  const resultQuestion = document.getElementById('resultQuestion');
  const statTotal = document.getElementById('statTotal');
  const statYes = document.getElementById('statYes');
  const statNo = document.getElementById('statNo');
  const historyList = document.getElementById('historyList');
  const resetBtn = document.getElementById('resetBtn');
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');

  const STORAGE_KEY = 'may-phan-quyet-state-v1';
  const MAX_HISTORY = 8;
  const THINK_DELAY_MS = 380;

  let state = loadState();
  let audioCtx = null;
  let isBusy = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { total: 0, yes: 0, no: 0, history: [], soundOn: true };
      const parsed = JSON.parse(raw);
      return {
        total: Number(parsed.total) || 0,
        yes: Number(parsed.yes) || 0,
        no: Number(parsed.no) || 0,
        history: Array.isArray(parsed.history) ? parsed.history.slice(0, MAX_HISTORY) : [],
        soundOn: parsed.soundOn !== false
      };
    } catch (err) {
      return { total: 0, yes: 0, no: 0, history: [], soundOn: true };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* storage unavailable (private mode, quota, etc.) — app still works, just won't persist */
    }
  }

  function renderStats() {
    statTotal.textContent = String(state.total);
    statYes.textContent = String(state.yes);
    statNo.textContent = String(state.no);
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (state.history.length === 0) {
      const li = document.createElement('li');
      li.className = 'history-empty';
      li.textContent = 'Chưa có lượt bấm nào.';
      historyList.appendChild(li);
      return;
    }
    state.history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item history-item-' + item.answer.toLowerCase();

      const q = document.createElement('span');
      q.className = 'history-q';
      q.textContent = item.question ? item.question : '(không có câu hỏi)';

      const a = document.createElement('span');
      a.className = 'history-a';
      a.textContent = item.answer;

      li.appendChild(q);
      li.appendChild(a);
      historyList.appendChild(li);
    });
  }

  function updateSoundIcon() {
    soundIcon.textContent = state.soundOn ? '🔊' : '🔇';
    soundToggle.setAttribute('aria-label', state.soundOn ? 'Tắt âm thanh' : 'Bật âm thanh');
  }

  function ensureAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, delay, volume) {
    if (!state.soundOn) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const startTime = ctx.currentTime + (delay || 0);
    const vol = volume || 0.18;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  function playPressSound() {
    playTone(180, 0.09, 'sine', 0, 0.2);
  }

  function playResultSound(isYes) {
    if (isYes) {
      playTone(523.25, 0.12, 'triangle', 0, 0.2);
      playTone(659.25, 0.16, 'triangle', 0.09, 0.2);
      playTone(784.0, 0.22, 'triangle', 0.18, 0.2);
    } else {
      playTone(220, 0.16, 'sawtooth', 0, 0.15);
      playTone(174.6, 0.24, 'sawtooth', 0.1, 0.15);
    }
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (err) { /* ignore */ }
    }
  }

  function handlePress() {
    if (isBusy) return;
    isBusy = true;
    mainButton.classList.add('is-pressed');
    mainButton.disabled = true;
    btnLabel.textContent = '···';
    resultZone.classList.remove('is-visible');
    playPressSound();
    vibrate(15);

    window.setTimeout(revealAnswer, THINK_DELAY_MS);
  }

  function revealAnswer() {
    const isYes = Math.random() < 0.5;
    const answer = isYes ? 'YES' : 'NO';
    const question = questionInput.value.trim();

    state.total += 1;
    if (isYes) state.yes += 1; else state.no += 1;
    state.history.unshift({ question, answer });
    state.history = state.history.slice(0, MAX_HISTORY);
    saveState();
    renderStats();
    renderHistory();

    stampText.textContent = answer;
    stamp.classList.remove('stamp-yes', 'stamp-no');
    stamp.classList.add(isYes ? 'stamp-yes' : 'stamp-no');
    const tilt = (Math.random() * 10 - 5).toFixed(1);
    stamp.style.setProperty('--tilt', tilt + 'deg');
    resultQuestion.textContent = question ? '“' + question + '”' : '';

    mainButton.classList.remove('is-pressed');
    btnLabel.textContent = 'BẤM';
    mainButton.disabled = false;
    isBusy = false;

    void resultZone.offsetWidth;
    resultZone.classList.add('is-visible');

    playResultSound(isYes);
    vibrate(isYes ? [20, 40, 20] : [60]);
  }

  function handleReset() {
    state = { total: 0, yes: 0, no: 0, history: [], soundOn: state.soundOn };
    saveState();
    renderStats();
    renderHistory();
    resultZone.classList.remove('is-visible');
    questionInput.value = '';
  }

  function handleSoundToggle() {
    state.soundOn = !state.soundOn;
    saveState();
    updateSoundIcon();
    if (state.soundOn) {
      ensureAudioCtx();
      playTone(440, 0.08, 'sine', 0, 0.15);
    }
  }

  mainButton.addEventListener('click', handlePress);
  resetBtn.addEventListener('click', handleReset);
  soundToggle.addEventListener('click', handleSoundToggle);
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePress();
    }
  });

  renderStats();
  renderHistory();
  updateSoundIcon();
})();

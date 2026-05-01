const rulesEl = document.getElementById('rules');
const answerRow = document.getElementById('answerRow');
const keyboard = document.getElementById('keyboard');
const roundLabel = document.getElementById('roundLabel');
const timerEl = document.getElementById('timer');
const feedbackEl = document.getElementById('feedback');
const streakValue = document.getElementById('streakValue');
const coinValue = document.getElementById('coinValue');
const streakFill = document.getElementById('streakFill');
const submitBtn = document.getElementById('submitBtn');
const hintBtn = document.getElementById('hintBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const skipBtn = document.getElementById('skipBtn');

const letterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const dictionary = [
  'banana','orange','planet','family','puzzle','dragon','guitar','coffee','tomato','winter',
  'music','rocket','stream','mellow','safely','pepper','garden','friend','safari','violet',
  'butter','candle','market','bubble','travel','thunder','pickle','sundae','camera','pickle'
];

const allRules = [
  { key: 'startConsonant', color: '#ef4444', code: 'C', title: 'Starts with a consonant', test: w => !'AEIOU'.includes(w[0]) },
  { key: 'hasVowel', color: '#fbbf24', code: 'A', title: 'Includes a vowel', test: w => /[AEIOU]/.test(w) },
  { key: 'len5', color: '#3b82f6', code: '5+', title: '5 or more letters', test: w => w.length >= 5 },
  { key: 'foodDrink', color: '#22c55e', code: '☕', title: 'Food or drink', test: w => ['BANANA','ORANGE','COFFEE','PIZZA','TOMATO','PICKLE','SODA','TEA','BUBBLE','SUNDAE'].includes(w) },
  { key: 'startsB', color: '#a855f7', code: 'B', title: 'Starts with B', test: w => w.startsWith('B') },
  { key: 'doubleLetter', color: '#14b8a6', code: 'LL', title: 'Has a double letter', test: w => /(.)\1/.test(w) },
  { key: 'endsE', color: '#f97316', code: 'E', title: 'Ends with E', test: w => w.endsWith('E') },
  { key: 'animal', color: '#10b981', code: '🐾', title: 'Animal-ish', test: w => ['DRAGON','MOUSE','HORSE','EAGLE','TIGER'].includes(w) },
];

let round = 1;
let streak = 0;
let coins = 0;
let timeLeft = 45;
let currentRules = [];
let answer = [];
let timer = null;
let locked = false;

function pickRules(){
  const pool = [...allRules].sort(() => Math.random() - 0.5);
  currentRules = pool.slice(0, 4);
}

function targetWord(){
  const valid = dictionary.filter(w => currentRules.every(r => r.test(w.toUpperCase())));
  return valid[Math.floor(Math.random() * valid.length)] || 'BANANA';
}

let goal = targetWord();

function renderRules(){
  rulesEl.innerHTML = '';
  currentRules.forEach(rule => {
    const div = document.createElement('div');
    div.className = 'rule';
    div.style.background = `linear-gradient(180deg, ${rule.color}ee, #16162c)`;
    div.innerHTML = `<div class="code">${rule.code}</div><small>${rule.title}</small>`;
    rulesEl.appendChild(div);
  });
}

function renderAnswer(){
  answerRow.innerHTML = '';
  answer.forEach(ch => {
    const s = document.createElement('div');
    s.className = 'letter';
    s.textContent = ch;
    answerRow.appendChild(s);
  });
}

function renderKeyboard(){
  keyboard.innerHTML = '';
  letterPool.forEach(letter => {
    const b = document.createElement('button');
    b.className = 'key';
    b.textContent = letter;
    b.onclick = () => { if (!locked && answer.length < 12) { answer.push(letter); renderAnswer(); } };
    keyboard.appendChild(b);
  });
  const back = document.createElement('button');
  back.className = 'key';
  back.textContent = '⌫';
  back.onclick = () => { if (!locked) { answer.pop(); renderAnswer(); } };
  keyboard.appendChild(back);
}

function formatTimer(){
  timerEl.textContent = `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`;
}

function newRound(){
  locked = false;
  answer = [];
  pickRules();
  goal = targetWord();
  roundLabel.textContent = `Round ${round}`;
  renderRules();
  renderAnswer();
  feedbackEl.textContent = 'Make a word that fits every rule.';
  feedbackEl.className = '';
  timeLeft = 45;
  formatTimer();
  clearInterval(timer);
  timer = setInterval(() => {
    if (locked) return;
    timeLeft--;
    formatTimer();
    if (timeLeft <= 0) failRound('Time! Skip burned.');
  }, 1000);
}

function scoreWord(word){
  const w = word.toUpperCase();
  const fits = currentRules.every(r => r.test(w));
  if (!fits) return { ok:false, msg:'Nope, that misses a rule.' };
  if (w !== goal) return { ok:false, msg:`Close, but not this round. Try ${goal.length} letters and the rules.` };
  return { ok:true, msg:'Perfect!' };
}

function submit(){
  if (locked) return;
  const word = answer.join('');
  if (!word) return;
  const result = scoreWord(word);
  if (result.ok) {
    locked = true;
    streak++;
    coins += 10 + streak;
    feedbackEl.textContent = `Perfect! ${goal.toUpperCase()}`;
    feedbackEl.className = 'good';
    updateHud();
    setTimeout(() => { round++; newRound(); }, 900);
  } else {
    streak = 0;
    feedbackEl.textContent = result.msg;
    feedbackEl.className = 'bad';
    updateHud();
  }
}

function failRound(msg){
  if (locked) return;
  locked = true;
  streak = 0;
  feedbackEl.textContent = msg;
  feedbackEl.className = 'bad';
  updateHud();
  setTimeout(() => { round++; newRound(); }, 1100);
}

function hint(){
  const clues = currentRules.map(r => r.title).join(' • ');
  feedbackEl.textContent = `Hint: ${clues}`;
  feedbackEl.className = '';
  coins = Math.max(0, coins - 1);
  updateHud();
}

function shuffle(){
  answer.sort(() => Math.random() - 0.5);
  renderAnswer();
}

function skip(){ failRound('Skipped. New round coming up.'); }

function updateHud(){
  streakValue.textContent = streak;
  coinValue.textContent = coins;
  streakFill.style.width = `${Math.min(100, streak * 12)}%`;
}

submitBtn.onclick = submit;
hintBtn.onclick = hint;
shuffleBtn.onclick = shuffle;
skipBtn.onclick = skip;
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') submit();
  if (e.key === 'Backspace') { answer.pop(); renderAnswer(); }
});

renderKeyboard();
updateHud();
newRound();

/* ===== Bài kiểm tra sinh nhật — script.js ===== */
const CONFIG = {
  music: '/happybirthday.mp3',
  bigLines: ['CHÚC MỪNG', 'SINH NHẬT', 'NHƯ Ý!'],
  colors: ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#ffffff', '#b388ff']
};
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const steps = [...document.querySelectorAll('.step')];
const music = $('music'), muteBtn = $('mute');
let run = 0;

/* ---------- confetti (canvas) ---------- */
const cv = $('fx'), ctx = cv.getContext('2d');
let parts = [], raf = 0;
function size() { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', size); size();
function loop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 20);
  for (const p of parts) {
    p.vy += 0.18; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.fillRect(-p.s, -p.s / 2, p.s * 2, p.s); ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(loop) : 0;
}
function confetti(n, x, y, power) {
  n = reduced ? Math.ceil(n / 4) : n;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, v = Math.random() * power;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.5, s: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: CONFIG.colors[(Math.random() * 6) | 0], life: 90 + Math.random() * 60 });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}
function celebrate() {
  [0, 400, 800, 1300, 1900].forEach((t, i) => setTimeout(() => confetti(60, innerWidth * (0.2 + 0.15 * i), innerHeight * 0.35, 11), t));
  confetti(60, innerWidth / 2, -10, 5);
}

/* ---------- âm thanh ---------- */
music.src = CONFIG.music;
function playMusic() { music.volume = 0.8; const p = music.play(); if (p && p.catch) p.catch(() => {}); muteBtn.hidden = false; }
muteBtn.onclick = () => { music.muted = !music.muted; muteBtn.textContent = music.muted ? '🔇' : '🔊'; };

/* ---------- chuyển trang ---------- */
function go(n) {
  steps.forEach((s, i) => { s.classList.toggle('active', i === n - 1); s.toggleAttribute('inert', i !== n - 1); });
  document.body.dataset.step = n;
  const b = steps[n - 1].querySelector('.btn:not([hidden])');
  if (b) setTimeout(() => b.focus({ preventScroll: true }), 700);
  if (n === 4) grade();
  if (n === 5) birthdayReveal();
}
const cur = () => steps.findIndex((s) => s.classList.contains('active')) + 1;
document.addEventListener('click', (e) => { const b = e.target.closest('[data-next]'); if (b && !b.hidden) go(cur() + 1); });

/* ---------- trả lời câu hỏi ---------- */
document.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => {
  const step = o.closest('.step');
  step.querySelectorAll('.opt').forEach((x) => { x.disabled = true; });
  o.classList.add('picked');
  const note = step.querySelector('.note');
  note.textContent = o.dataset.r; note.hidden = false;
  setTimeout(() => (step.querySelector('.btn').hidden = false), 700);
}));

/* ---------- chấm điểm ---------- */
async function grade() {
  const id = ++run, num = $('scoreNum');
  $('stamp').classList.remove('hit'); $('why').hidden = true; $('toReveal').hidden = true; num.textContent = '0';
  await wait(1300);
  for (let v = 1; v <= 10; v++) { if (id !== run) return; num.textContent = v; await wait(180); }
  await wait(300); if (id !== run) return;
  $('stamp').classList.add('hit');
  confetti(40, innerWidth / 2, innerHeight / 2, 8);
  await wait(900); if (id !== run) return;
  $('why').hidden = false;
  await wait(1100); if (id !== run) return;
  $('toReveal').hidden = false; $('toReveal').focus({ preventScroll: true });
}

/* ---------- reveal ---------- */
async function birthdayReveal() {
  const id = ++run, big = $('big'); let k = 0;
  playMusic();                       // nhạc vào đúng lúc chúc mừng
  big.innerHTML = '';
  CONFIG.bigLines.forEach((line) => {
    const row = document.createElement('span'); row.className = 'line';
    [...line].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.animationDelay = 0.9 + k++ * 0.07 + 's'; row.appendChild(s); });
    big.appendChild(row);
  });
  const btn = steps[4].querySelector('.btn'); btn.hidden = true;
  await wait(500); if (id !== run) return;
  celebrate();
  await wait(3500); if (id !== run) return;
  btn.hidden = false;
}

/* ---------- hiệu ứng nút + replay ---------- */
function ripple(e) {
  const b = e.currentTarget, r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) / 2, s = document.createElement('span');
  s.className = 'rip'; s.style.cssText = `width:${d}px;height:${d}px;left:${(e.clientX || r.left + r.width / 2) - r.left - d / 2}px;top:${(e.clientY || r.top + r.height / 2) - r.top - d / 2}px`;
  b.appendChild(s); setTimeout(() => s.remove(), 600);
}
function resetExperience() {
  run++; music.pause(); music.currentTime = 0; muteBtn.hidden = true;
  document.querySelectorAll('.opt').forEach((o) => { o.disabled = false; o.classList.remove('picked'); });
  document.querySelectorAll('.note').forEach((n) => (n.hidden = true));
  [2, 3].forEach((n) => (steps[n - 1].querySelector('.btn').hidden = true));
  steps[5].querySelectorAll('*').forEach((e) => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
  go(1);
}
$('replay').onclick = resetExperience;
document.querySelectorAll('.btn,.opt').forEach((b) => b.addEventListener('pointerdown', ripple));
go(1);

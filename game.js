// ═══════════════════════════════════════════════
//   ATRAPAGEMAS — Firebase con escrituras atómicas
// ═══════════════════════════════════════════════

const ADMIN_CODE = 'gemas2025';
const MAX_PLAYERS = 5;
const GRID_COLS = 7;
const GRID_ROWS = 7;

const FIREBASE_BASE = 'https://atrapagemas-ea12d-default-rtdb.firebaseio.com/partida';

const GEM_IMAGES = [
  { id: 1,  name: 'Rubí I',        src: 'Gemas/Gema 1.png',   type: 1 },
  { id: 2,  name: 'Rubí II',       src: 'Gemas/Gema 1,2.png', type: 1 },
  { id: 3,  name: 'Rubí III',      src: 'Gemas/Gema 1,3.png', type: 1 },
  { id: 4,  name: 'Rubí IV',       src: 'Gemas/Gema 1,4.png', type: 1 },
  { id: 5,  name: 'Rubí V',        src: 'Gemas/Gema 1,5.png', type: 1 },
  { id: 6,  name: 'Zafiro I',      src: 'Gemas/Gema 2.png',   type: 2 },
  { id: 7,  name: 'Zafiro II',     src: 'Gemas/Gema 2,2.png', type: 2 },
  { id: 8,  name: 'Zafiro III',    src: 'Gemas/Gema 2,3.png', type: 2 },
  { id: 9,  name: 'Zafiro IV',     src: 'Gemas/Gema 2,4.png', type: 2 },
  { id: 10, name: 'Zafiro V',      src: 'Gemas/Gema 2,5.png', type: 2 },
  { id: 11, name: 'Esmeralda I',   src: 'Gemas/Gema 3.png',   type: 3 },
  { id: 12, name: 'Esmeralda II',  src: 'Gemas/Gema 3,2.png', type: 3 },
  { id: 13, name: 'Esmeralda III', src: 'Gemas/Gema 3,3.png', type: 3 },
  { id: 14, name: 'Esmeralda IV',  src: 'Gemas/Gema 3,4.png', type: 3 },
  { id: 15, name: 'Esmeralda V',   src: 'Gemas/Gema 3,5.png', type: 3 },
  { id: 16, name: 'Topacio I',     src: 'Gemas/Gema 4.png',   type: 4 },
  { id: 17, name: 'Topacio II',    src: 'Gemas/Gema 4,2.png', type: 4 },
  { id: 18, name: 'Topacio III',   src: 'Gemas/Gema 4,3.png', type: 4 },
  { id: 19, name: 'Topacio IV',    src: 'Gemas/Gema 4,4.png', type: 4 },
  { id: 20, name: 'Topacio V',     src: 'Gemas/Gema 4,5.png', type: 4 },
  { id: 21, name: 'Diamante I',    src: 'Gemas/Gema 5.png',   type: 5 },
  { id: 22, name: 'Diamante II',   src: 'Gemas/Gema 5,2.png', type: 5 },
  { id: 23, name: 'Diamante III',  src: 'Gemas/Gema 5,3.png', type: 5 },
  { id: 24, name: 'Diamante IV',   src: 'Gemas/Gema 5,4.png', type: 5 },
  { id: 25, name: 'Diamante V',    src: 'Gemas/Gema 5,5.png', type: 5 },
];

const GEM_CODES = {
  1:'1492',  2:'8374',  3:'2056',  4:'9182',  5:'4731',
  6:'5620',  7:'3819',  8:'7241',  9:'5093',  10:'2814',
  11:'6359', 12:'4920', 13:'8173', 14:'3054', 15:'9681',
  16:'1743', 17:'5260', 18:'8937', 19:'4125', 20:'7362',
  21:'6051', 22:'3498', 23:'1584', 24:'9237', 25:'7416'
};

function generateGrid() {
  const grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const usedIds = new Set();
    const rowIds = [];
    [1,2,3,4,5].forEach(type => {
      const pool = GEM_IMAGES.filter(g => g.type === type && !usedIds.has(g.id));
      const pick = pool[Math.floor(Math.random() * pool.length)];
      rowIds.push(pick.id);
      usedIds.add(pick.id);
    });
    while (rowIds.length < GRID_COLS) {
      const pool = GEM_IMAGES.filter(g => !usedIds.has(g.id));
      const pick = pool[Math.floor(Math.random() * pool.length)];
      rowIds.push(pick.id);
      usedIds.add(pick.id);
    }
    rowIds.sort(() => Math.random() - 0.5);
    grid.push(rowIds.map(id => ({ gemId: id, revealed: false, code: GEM_CODES[id] })));
  }
  return grid;
}

function timeAgo(ts) {
  if (!ts) return '—';
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `hace ${d}s`;
  if (d < 3600) return `hace ${Math.floor(d/60)}m`;
  return `hace ${Math.floor(d/3600)}h`;
}

// ── Capa de acceso a Firebase ──
// Escribe/lee nodos individuales para evitar conflictos entre jugadores

async function fbGet(path) {
  try {
    const r = await fetch(`${FIREBASE_BASE}/${path}.json`);
    return await r.json();
  } catch { return null; }
}

async function fbSet(path, value) {
  try {
    await fetch(`${FIREBASE_BASE}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    });
  } catch(e) { console.error('fbSet error', e); }
}

async function fbPatch(path, value) {
  try {
    await fetch(`${FIREBASE_BASE}/${path}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    });
  } catch(e) { console.error('fbPatch error', e); }
}

async function fbDelete(path) {
  try {
    await fetch(`${FIREBASE_BASE}/${path}.json`, { method: 'DELETE' });
  } catch(e) { console.error('fbDelete error', e); }
}

// ── Estado local en caché ──
let cachedState = null;

async function fetchFullState() {
  const data = await fbGet('');
  if (!data) {
    cachedState = { started: false, ended: false, startedAt: null, admin: null, players: {}, log: [] };
  } else {
    cachedState = data;
    if (!cachedState.players) cachedState.players = {};
    if (!cachedState.log)     cachedState.log = [];
  }
  return cachedState;
}

// Los jugadores se guardan como objeto { "0": {...}, "1": {...} }
// para que cada jugador solo escriba su propio nodo
function getPlayersArray(state) {
  if (!state.players) return [];
  if (Array.isArray(state.players)) return state.players;
  return Object.keys(state.players)
    .sort((a,b) => Number(a) - Number(b))
    .map(k => state.players[k])
    .filter(Boolean);
}

// Sincronización cada 1.5s
setInterval(async () => {
  await fetchFullState();
  if (typeof refresh === 'function') refresh();
}, 1500);

fetchFullState();

// ── GameState ──
const GameState = {

  get() {
    if (!cachedState) return { started: false, ended: false, startedAt: null, admin: null, players: {}, log: [] };
    return cachedState;
  },

  getPlayers() {
    return getPlayersArray(this.get());
  },

  getMe() {
    try { return JSON.parse(localStorage.getItem('atrapagemas_me')); }
    catch { return null; }
  },

  // Admin entra — solo escribe su nodo
  async joinAsAdmin() {
    await fbPatch('', { admin: { joinedAt: Date.now() } });
    await this._log('⭐ Administrador conectado');
    localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'admin' }));
    await fetchFullState();
  },

  // Jugador entra — escribe SOLO su nodo /players/N sin tocar los demás
  async joinAsPlayer(name) {
    // Leer lista actualizada de jugadores
    const playersRaw = await fbGet('players');
    const playersObj = playersRaw || {};
    const playersArr = Object.keys(playersObj)
      .sort((a,b) => Number(a)-Number(b))
      .map(k => playersObj[k])
      .filter(Boolean);

    // ¿Ya existe con ese nombre?
    const existingIdx = playersArr.findIndex(p => p && p.name === name);
    if (existingIdx !== -1) {
      localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'player', name, idx: existingIdx }));
      return existingIdx;
    }

    // ¿Está lleno?
    if (playersArr.length >= MAX_PLAYERS) return null;

    const idx = playersArr.length;

    // Escribir SOLO este jugador en su slot
    await fbSet(`players/${idx}`, {
      name, idx,
      joinedAt: Date.now(),
      grid: generateGrid(),
      score: 0,
      moves: 0,
      lastAction: null
    });

    await this._log(`✦ ${name} se unió como Jugador ${idx + 1}`);
    localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'player', name, idx }));
    await fetchFullState();
    return idx;
  },

  // INICIAR — escribe solo los campos de control, no toca jugadores
  async startGame() {
    // Resetear puntuaciones de cada jugador individualmente
    const players = getPlayersArray(cachedState);
    for (const p of players) {
      await fbPatch(`players/${p.idx}`, {
        score: 0, moves: 0, lastAction: null,
        grid: generateGrid()
      });
    }
    await fbPatch('', { started: true, ended: false, startedAt: Date.now() });
    await this._log('🚀 ¡La partida ha comenzado!');
    await fetchFullState();
  },

  // TERMINAR — borra jugadores, guarda resultados finales
  async endGame() {
    const players = getPlayersArray(cachedState);
    const finalResults = players.map(p => ({
      name: p.name,
      score: p.score,
      moves: p.moves,
      revealed: p.grid ? p.grid.flat().filter(c => c.revealed).length : 0
    })).sort((a,b) => b.score - a.score);

    await this._log('🏁 La partida ha finalizado.');

    // Borrar todos los nodos de una vez
    await fbSet('', {
      started: false,
      ended: true,
      startedAt: null,
      admin: null,
      players: {},
      log: cachedState.log || [],
      finalResults
    });

    localStorage.removeItem('atrapagemas_me');
    await fetchFullState();
  },

  // Revelar celda — escribe SOLO la celda concreta del jugador
  async revealCell(playerIdx, row, col, inputCode) {
    const state = this.get();
    if (!state.started || state.ended) return false;

    const players = getPlayersArray(state);
    const player = players[playerIdx];
    if (!player || !player.grid) return false;

    // Fila activa
    let activeRow = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      if (!player.grid[r].every(c => c.revealed)) { activeRow = r; break; }
    }
    if (activeRow === -1 || row !== activeRow) return false;

    const cell = player.grid[row][col];
    if (cell.revealed) return false;
    if (inputCode !== cell.code) return false;

    // Calcular nuevo estado del jugador
    const newGrid = JSON.parse(JSON.stringify(player.grid));
    newGrid[row][col].revealed = true;
    newGrid[row][col].code = null;

    let newScore = (player.score || 0) + 10;
    const rowComplete = newGrid[row].every(c => c.revealed);
    if (rowComplete) newScore += 25;

    const gem = GEM_IMAGES.find(g => g.id === cell.gemId);

    // Escribir solo el nodo de este jugador
    await fbSet(`players/${playerIdx}`, {
      ...player,
      grid: newGrid,
      score: newScore,
      moves: (player.moves || 0) + 1,
      lastAction: { row, col, ts: Date.now() }
    });

    await this._log(`◆ ${player.name} desbloqueó "${gem.name}" (fila ${row + 1})`);
    if (rowComplete) await this._log(`🎉 ${player.name} completó la fila ${row + 1} (+25 bonus)`);

    await fetchFullState();
    return true;
  },

  // Añadir entrada al log — escribe solo el log
  async _log(msg) {
    const current = await fbGet('log') || [];
    const logs = Array.isArray(current) ? current : Object.values(current);
    logs.unshift({ msg, ts: Date.now() });
    if (logs.length > 150) logs.length = 150;
    await fbSet('log', logs);
  }
};

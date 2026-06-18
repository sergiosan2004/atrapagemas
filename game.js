// ═══════════════════════════════════════════════
//   ATRAPAGEMAS — Lógica central
// ═══════════════════════════════════════════════

const ADMIN_CODE = 'gemas2025';
const MAX_PLAYERS = 5;
const GRID_COLS = 7;
const GRID_ROWS = 7;

// 25 imágenes reales — carpeta "gemas/"
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

// PIN único de 4 dígitos por foto — fijo siempre
const GEM_CODES = {
  1:  '1492',  2:  '8374',  3:  '2056',  4:  '9182',  5:  '4731',
  6:  '5620',  7:  '3819',  8:  '7241',  9:  '5093',  10: '2814',
  11: '6359',  12: '4920',  13: '8173',  14: '3054',  15: '9681',
  16: '1743',  17: '5260',  18: '8937',  19: '4125',  20: '7362',
  21: '6051',  22: '3498',  23: '1584',  24: '9237',  25: '7416'
};

// Genera cuadrícula 7×7:
function generateGrid() {
  const grid = [];
  const GEM_TYPES = [1, 2, 3, 4, 5];

  for (let r = 0; r < GRID_ROWS; r++) {
    let rowIds = [];
    const usedIds = new Set();

    // Garantizar al menos 1 de cada tipo
    for (const t of GEM_TYPES) {
      const candidates = GEM_IMAGES.filter(g => g.type === t && !usedIds.has(g.id));
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      rowIds.push(pick.id);
      usedIds.add(pick.id);
    }

    // Completar hasta 7 sin repetir gemId en la fila
    while (rowIds.length < GRID_COLS) {
      const remaining = GEM_IMAGES.filter(g => !usedIds.has(g.id));
      if (!remaining.length) break;
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      rowIds.push(pick.id);
      usedIds.add(pick.id);
    }

    // Mezclar el orden de la fila y validar que no haya 3 del mismo tipo consecutivos
    let attempts = 0;
    let isValid = false;
    while (!isValid && attempts < 100) {
      rowIds = rowIds.sort(() => Math.random() - 0.5);
      isValid = true;
      
      // Verificar que no haya 3 del mismo tipo consecutivos
      for (let i = 0; i < rowIds.length - 2; i++) {
        const type1 = GEM_IMAGES.find(g => g.id === rowIds[i]).type;
        const type2 = GEM_IMAGES.find(g => g.id === rowIds[i + 1]).type;
        const type3 = GEM_IMAGES.find(g => g.id === rowIds[i + 2]).type;
        
        if (type1 === type2 && type2 === type3) {
          isValid = false;
          break;
        }
      }
      attempts++;
    }

    const row = rowIds.map(gemId => ({
      gemId,
      revealed: false,
      code: GEM_CODES[gemId]
    }));
    grid.push(row);
  }
  return grid;
}

// Utilidad: tiempo relativo
function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

// ── Estado global (localStorage) ──
const GameState = {
  _key: 'atrapagemas_state',

  _default() {
    return { admin: null, players: [], started: false, ended: false, log: [], startedAt: null };
  },

  get() {
    try {
      const s = localStorage.getItem(GameState._key);
      return s ? JSON.parse(s) : GameState._default();
    } catch { return GameState._default(); }
  },

  save(state) {
    localStorage.setItem(GameState._key, JSON.stringify(state));
  },

  addLog(state, msg) {
    state.log.unshift({ msg, ts: Date.now() });
    if (state.log.length > 150) state.log.length = 150;
  },

  joinAsAdmin() {
    const state = GameState.get();
    state.admin = { joinedAt: Date.now() };
    GameState.addLog(state, '⭐ Administrador conectado');
    GameState.save(state);
    localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'admin' }));
  },

  joinAsPlayer(name) {
    const state = GameState.get();
    const existingIdx = state.players.findIndex(p => p.name === name);
    if (existingIdx !== -1) {
      localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'player', name, idx: existingIdx }));
      return existingIdx;
    }
    if (state.players.length >= MAX_PLAYERS) return null;
    const idx = state.players.length;
    state.players.push({
      name, idx,
      joinedAt: Date.now(),
      grid: generateGrid(),
      score: 0,
      moves: 0,
      lastAction: null,
    });
    GameState.addLog(state, `✦ ${name} se unió como Jugador ${idx + 1}`);
    GameState.save(state);
    localStorage.setItem('atrapagemas_me', JSON.stringify({ role: 'player', name, idx }));
    return idx;
  },

  getMe() {
    try { return JSON.parse(localStorage.getItem('atrapagemas_me')); }
    catch { return null; }
  },

  // CAMBIO SEGURO: Inicializa limpiando tableros y estados previos para permitir el arranque limpio
  startGame() {
    const state = GameState.get();
    state.started = true;
    state.ended = false;
    state.startedAt = Date.now();
    
    // Si ya hay jugadores en la sala, les reseteamos puntuaciones y tableros para la nueva partida
    if (state.players && state.players.length > 0) {
      state.players.forEach(p => {
        p.score = 0;
        p.moves = 0;
        p.lastAction = null;
        p.grid = generateGrid();
      });
    }
    
    if (state.finalResults) delete state.finalResults;

    GameState.addLog(state, '🚀 ¡La partida ha comenzado!');
    GameState.save(state);
  },

  endGame() {
    const state = GameState.get();
    state.ended = true;
    state.started = false;
    GameState.addLog(state, '🏁 La partida ha finalizado.');
    const finalResults = state.players.map(p => ({
      name: p.name,
      score: p.score,
      moves: p.moves,
      revealed: p.grid.flat().filter(c => c.revealed).length
    }));
    state.finalResults = finalResults;
    state.players = [];
    state.admin = null;
    GameState.save(state);
    localStorage.removeItem('atrapagemas_me');
  },

  revealCell(playerIdx, row, col, inputCode) {
    const state = GameState.get();
    if (!state.started || state.ended) return false;

    const player = state.players[playerIdx];
    if (!player) return false;

    let activeRow = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      if (!player.grid[r].every(c => c.revealed)) {
        activeRow = r;
        break;
      }
    }
    if (activeRow === -1) return false;
    if (row !== activeRow) return false;

    const cell = player.grid[row][col];
    if (cell.revealed) return false;
    if (inputCode !== cell.code) return false;

    cell.revealed = true;
    player.moves++;
    player.lastAction = { row, col, ts: Date.now() };
    const gem = GEM_IMAGES.find(g => g.id === cell.gemId);
    GameState.addLog(state, `◆ ${player.name} desbloqueó "${gem.name}" (fila ${row + 1})`);
    player.score += 10;

    if (player.grid[row].every(c => c.revealed)) {
      player.score += 25;
      GameState.addLog(state, `🎉 ${player.name} completó la fila ${row + 1} (+25 bonus)`);
    }

    GameState.save(state);
    return true;
  },
};


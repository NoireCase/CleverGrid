const STATE = { EMPTY: 0, PEN_X: 1, PEN_V: 2, PENCIL_Q: 3, PENCIL_X: 4 };

function parseSolution(solution) {
    if (solution && typeof solution === 'object') {
        const parts = [solution.suspect, solution.weapon, solution.location];
        return parts.every(Boolean) ? parts : [];
    }

    if (typeof solution === 'string' && solution.trim()) {
        try {
            const parts = atob(solution).split('-');
            return parts.length === 3 ? parts : [];
        } catch (e) {
            return [];
        }
    }

    return [];
}

function solutionToText(solution) {
    const parts = parseSolution(solution);
    return parts.length === 3 ? parts.join('-') : '';
}

function formatDifficulty(difficulty) {
    if (window.CleverGridCaseLibrary && typeof window.CleverGridCaseLibrary.formatDifficulty === 'function') {
        return window.CleverGridCaseLibrary.formatDifficulty(difficulty);
    }
    return difficulty || '';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function getCaseClues(data) {
    return Array.isArray(data && data.clues) ? data.clues : [];
}

function getClueText(clue) {
    if (clue && typeof clue === 'object') return clue.text || clue.content || '';
    return clue || '';
}

function splitCardMeta(value) {
    return String(value || '')
        .split(/[·,，、/|]+/)
        .map(item => item.trim())
        .filter(Boolean);
}

function getDossierIcon(obj, type, size = 'card') {
    const name = escapeHtml(obj && obj.name ? obj.name : '');
    const icons = window.CleverGridIcons;
    const iconName = icons ? icons.resolveObjectIcon(obj, type) : 'circleHelp';
    const iconSvg = icons ? icons.render(iconName, { label: name }) : '';

    return `
        <span class="asset-icon asset-icon-${type} asset-icon-${size}" title="${name}">
            ${iconSvg}
        </span>
    `;
}

function getTypeIcon(type) {
    const placeholders = {
        suspect: { id: 'S', name: '凶手' },
        weapon: { id: 'W', name: '凶器' },
        location: { id: 'L', name: '地点' }
    };
    return getDossierIcon(placeholders[type] || placeholders.suspect, type, 'slot');
}

function hydrateStaticIcons() {
    if (!window.CleverGridIcons) return;

    document.querySelectorAll('[data-lucide]').forEach(el => {
        const key = el.getAttribute('data-lucide');
        const iconName = window.CleverGridIcons.toolIconMap[key] || key;
        const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
        el.innerHTML = window.CleverGridIcons.render(iconName, { label });
    });
}

function formatDurationValue(value) {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'number' && Number.isFinite(value)) return `${value}分钟`;
    return String(value);
}

function estimateDurationByClueCount(clueCount) {
    if (clueCount <= 5) return '5-8分钟';
    if (clueCount <= 10) return '10-15分钟';
    if (clueCount <= 15) return '15-20分钟';
    return '20-30分钟';
}

function getCaseDurationText(data) {
    const durationFields = ['estimatedTime', 'estimatedDuration', 'estimatedMinutes', 'timeMinutes', 'duration', 'playTime'];
    const explicitValue = durationFields
        .map(field => data[field])
        .find(value => value !== undefined && value !== null && value !== '');
    const explicitDuration = formatDurationValue(explicitValue);
    return explicitDuration || estimateDurationByClueCount(getCaseClues(data).length);
}

// GM Debug System
const debugSystem = {
    buffer: [],
    secret: 'wangjiaqi',

    init() {
        window.addEventListener('keyup', (e) => {
            this.buffer.push(e.key);
            if (this.buffer.length > this.secret.length) this.buffer.shift();
            if (this.buffer.join('') === this.secret) {
                this.toggleUI();
                this.buffer = [];
            }
        });

        // Drag logic for GM Panel
        this.initDrag();
    },

    initDrag() {
        const el = document.getElementById('gm-panel');
        const header = el.querySelector('h3');
        let isDown = false;
        let offset = [0, 0];

        header.addEventListener('mousedown', (e) => {
            isDown = true;
            offset = [
                el.offsetLeft - e.clientX,
                el.offsetTop - e.clientY
            ];
        }, true);

        document.addEventListener('mouseup', () => {
            isDown = false;
        }, true);

        document.addEventListener('mousemove', (e) => {
            if (isDown) {
                e.preventDefault();
                el.style.left = (e.clientX + offset[0]) + 'px';
                el.style.top  = (e.clientY + offset[1]) + 'px';
            }
        }, true);
    },

    toggleUI() {
        const el = document.getElementById('gm-panel');
        const isVisible = el.style.display === 'block';
        el.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) this.render();
    },

    render() {
        const data = GAME_DATA[game.idx];
        if (data && data.solution) {
            document.getElementById('gm-solution-text').innerText = solutionToText(data.solution) || "Error reading";
        }
    },

    toggleXRay() {
        document.body.classList.toggle('debug-xray');
    },

    unlockAll() {
        game.solvedLevels = new Array(GAME_DATA.length).fill(true);
        game.solvedCases = {};
        GAME_DATA.forEach((_, i) => {
            game.solvedCases[game.getCaseId(i)] = true;
        });
        game.saveGlobal();
        game.loadLevel(game.idx);
        alert("All levels unlocked.");
    },

    nukeSave() {
        if(confirm("NUKE ALL DATA?")) {
            localStorage.clear();
            location.reload();
        }
    },

    jumpLevel() {
        const val = parseInt(document.getElementById('gm-level-input').value);
        if (!isNaN(val)) game.loadLevel(val);
    },

    instantWin() {
        const data = GAME_DATA[game.idx];
        if (!data.fullTruth) {
            alert("错误：当前案件数据中缺少 'fullTruth' 配置。");
            return;
        }

        // 1. Grid Auto Fill (Logic from Truth)
        game.gridState = {};
        const allKeys = [];
        data.suspects.forEach(s => data.weapons.forEach(w => allKeys.push(`${s.id}-${w.id}`)));
        data.weapons.forEach(w => data.locations.forEach(l => allKeys.push(`${w.id}-${l.id}`)));
        data.suspects.forEach(s => data.locations.forEach(l => allKeys.push(`${s.id}-${l.id}`)));

        const trueKeys = new Set();
        data.fullTruth.forEach(([s, w, l]) => {
            trueKeys.add(`${s}-${w}`);
            trueKeys.add(`${w}-${l}`);
            trueKeys.add(`${s}-${l}`);
            game.gridState[`${s}-${w}`] = STATE.PEN_V;
            game.gridState[`${w}-${l}`] = STATE.PEN_V;
            game.gridState[`${s}-${l}`] = STATE.PEN_V;
        });

        allKeys.forEach(key => {
            if (!trueKeys.has(key)) game.gridState[key] = STATE.PEN_X;
        });

        game.saveLevelState();
        game.updateView();

        // 2. Auto Fill Truth Slots & Submit
        const solParts = parseSolution(data.solution);
        game.truthState = {
            suspect: solParts[0],
            weapon: solParts[1],
            location: solParts[2]
        };
        game.updateTruthUI();

        // 3. Trigger Win
        setTimeout(() => game.submitTruth(), 200);
    }
};

const game = {
    idx: 0,
    currentTool: 'pen',
    smartMode: false,
    gridState: {},
    solvedLevels: [],
    solvedCases: {},
    clueState: [],
    eliminatedCards: [],
    historyStack: [],
    redoStack: [],
    snapshot: null,
    cellSize: 61,
    isDragging: false,
    truthState: { suspect: null, weapon: null, location: null },

    init() {
        this.loadGlobalSave();
        this.loadLevel(this.idx);
        this.initResizers();
        this.initZoom();
        this.initDragDrop();
        this.updateToolbarUI();
        document.addEventListener('mouseup', () => { this.isDragging = false; });

        // Init GM
        debugSystem.init();
    },

    getCaseId(i = this.idx) {
        const data = GAME_DATA[i];
        return data && data.id ? data.id : `case-${i + 1}`;
    },

    getLevelStorageKey(i = this.idx) {
        return `murdle_final_v5_case_${this.getCaseId(i)}`;
    },

    getLegacyLevelStorageKey(i = this.idx) {
        return `murdle_final_v5_level_${i}`;
    },

    isCaseSolved(i = this.idx) {
        return Boolean(this.solvedCases[this.getCaseId(i)] || this.solvedLevels[i]);
    },

    syncSolvedLevelsFromCases() {
        this.solvedLevels = GAME_DATA.map((_, i) => Boolean(this.solvedCases[this.getCaseId(i)] || this.solvedLevels[i]));
    },

    loadGlobalSave() {
        const raw = localStorage.getItem('murdle_final_v5_global');
        if (raw) {
            const d = JSON.parse(raw);
            if (d.currentCaseId) {
                const savedIndex = GAME_DATA.findIndex(item => item.id === d.currentCaseId);
                this.idx = savedIndex >= 0 ? savedIndex : (d.currentIdx || 0);
            } else {
                this.idx = d.currentIdx || 0;
            }
            this.solvedLevels = d.solvedLevels || [];
            this.solvedCases = d.solvedCases || {};
            if (!d.solvedCases && Array.isArray(d.solvedLevels)) {
                d.solvedLevels.forEach((solved, i) => {
                    if (solved) this.solvedCases[this.getCaseId(i)] = true;
                });
            }
            this.smartMode = d.smartMode || false;
        } else {
            this.solvedLevels = new Array(GAME_DATA.length).fill(false);
            this.solvedCases = {};
        }
        this.syncSolvedLevelsFromCases();
    },

    saveGlobal() {
        this.syncSolvedLevelsFromCases();
        localStorage.setItem('murdle_final_v5_global', JSON.stringify({
            currentCaseId: this.getCaseId(),
            currentIdx: this.idx,
            solvedCases: this.solvedCases,
            solvedLevels: this.solvedLevels,
            smartMode: this.smartMode
        }));
    },

    loadLevelState() {
        const key = this.getLevelStorageKey();
        const legacyKey = this.getLegacyLevelStorageKey();
        const raw = localStorage.getItem(key);
        const legacyRaw = raw ? null : localStorage.getItem(legacyKey);
        const stateRaw = raw || legacyRaw;
        if (stateRaw) {
            const d = JSON.parse(stateRaw);
            this.gridState = d.grid || {};
            this.clueState = d.clues || [];
            this.eliminatedCards = d.eliminated || [];
            this.truthState = d.truth || { suspect: null, weapon: null, location: null };
            this.snapshot = d.snapshot || null;
            if (!raw && legacyRaw) this.saveLevelState();
        } else {
            this.resetLevelData();
        }
        this.historyStack = [];
        this.redoStack = [];
    },

    saveLevelState() {
        const key = this.getLevelStorageKey();
        localStorage.setItem(key, JSON.stringify({
            caseId: this.getCaseId(),
            grid: this.gridState,
            clues: this.clueState,
            eliminated: this.eliminatedCards,
            truth: this.truthState,
            snapshot: this.snapshot
        }));
    },

    resetLevelData() {
        this.gridState = {};
        this.clueState = [];
        this.eliminatedCards = [];
        this.truthState = { suspect: null, weapon: null, location: null };
        this.historyStack = [];
        this.redoStack = [];
    },

    resetLevel() {
        if(confirm('确定要清空当前的推理记录吗？')) {
            this.resetLevelData();
            this.saveLevelState();
            this.updateView();
            this.renderClues();
            this.renderCards();
            this.updateTruthUI();
        }
    },

    loadLevel(i) {
        if (i < 0 || i >= GAME_DATA.length) return;
        this.idx = i;
        this.loadLevelState();
        this.saveGlobal();

        const data = GAME_DATA[i];
        const clueCount = getCaseClues(data).length;
        const difficultyText = formatDifficulty(data.difficulty) || '未标注';
        const durationText = getCaseDurationText(data);
        document.getElementById('case-display-info').innerHTML = `
            <span class="case-heading">CASE ${String(i+1).padStart(2, '0')}: ${escapeHtml(data.title || '未命名案件')}</span>
            <span class="case-meta">难度：${escapeHtml(difficultyText)}</span>
            <span class="case-meta">线索：${clueCount}</span>
            <span class="case-meta">预计：${escapeHtml(durationText)}</span>
        `;
        document.getElementById('btn-prev').disabled = (i === 0);

        const isCompleted = this.isCaseSolved(i);
        document.getElementById('btn-next').disabled = !isCompleted || (i >= GAME_DATA.length - 1);

        this.renderCards();
        this.renderClues();
        this.renderGrid(data);
        this.updateView();
        this.updateTruthUI();
        this.updateToolbarUI();
    },

    renderCards() {
        const data = GAME_DATA[this.idx];
        // Note: added 'type' param to genCard for DragDrop
        document.getElementById('q2-suspects').innerHTML = data.suspects.map(s => this.genCard(s, 'suspect')).join('');
        document.getElementById('q3-locations').innerHTML = data.locations.map(l => this.genCard(l, 'location')).join('');
        document.getElementById('q3-weapons').innerHTML = data.weapons.map(w => this.genCard(w, 'weapon')).join('');
    },

    genCard(obj, type) {
        const isEliminated = this.eliminatedCards.includes(obj.id);

        const metaItems = [
            ...splitCardMeta(obj.traits),
            ...splitCardMeta(obj.tag)
        ];
        const metaHtml = metaItems.map(item => `<span class="meta-tag">${escapeHtml(item)}</span>`).join('');

        return `
        <div class="info-card ${isEliminated ? 'eliminated' : ''}" id="card-${escapeHtml(obj.id)}"
            draggable="true"
            ondragstart="game.onDragStart(event, '${obj.id}', '${type}', '', '${obj.name}')"
            onclick="game.toggleCard('${obj.id}')"
            oncontextmenu="event.preventDefault(); game.toggleCard('${obj.id}')">

            <div class="card-avatar">
                ${getDossierIcon(obj, type)}
            </div>

            <div class="card-content">
                <div class="card-title">${escapeHtml(obj.name)}</div>
                <div class="card-desc">${escapeHtml(obj.desc || '')}</div>
                <div class="card-meta">
                    ${metaHtml}
                </div>
            </div>
        </div>`;
    },

    // --- Drag & Drop Logic ---
    onDragStart(e, id, type, icon, name) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id, type, icon, name }));
        e.dataTransfer.effectAllowed = 'copy';
    },

    initDragDrop() {
        const slots = document.querySelectorAll('.truth-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', e => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', e => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', e => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));

                if (slot.dataset.type === data.type) {
                    this.truthState[data.type] = data.id;
                    this.updateTruthUI();
                    this.saveLevelState();
                }
            });
        });
    },

    updateTruthUI() {
        const data = GAME_DATA[this.idx];
        const types = ['suspect', 'weapon', 'location'];
        let filledCount = 0;

        types.forEach(type => {
            const id = this.truthState[type];
            const slot = document.getElementById(`slot-${type}`);

            if (id) {
                // Find object data
                let obj;
                if(type==='suspect') obj = data.suspects.find(x=>x.id===id);
                else if(type==='weapon') obj = data.weapons.find(x=>x.id===id);
                else obj = data.locations.find(x=>x.id===id);

                if(obj) {
                    slot.innerHTML = `
                        <div class="truth-slot-icon">${getDossierIcon(obj, type, 'slot')}</div>
                        <div class="truth-slot-text">${obj.name}</div>
                        <div class="slot-clear-btn" onclick="event.stopPropagation(); game.clearSlot('${type}')">✕</div>
                    `;
                    slot.classList.add('filled');
                    filledCount++;
                }
            } else {
                // Empty state
                const labels = { suspect: '拖入凶手', weapon: '拖入凶器', location: '拖入地点' };
                slot.innerHTML = `<span class="truth-placeholder">${getTypeIcon(type)}<span>${labels[type]}</span></span>`;
                slot.classList.remove('filled');
            }
        });

        document.getElementById('btn-submit').disabled = (filledCount < 3);
    },

    clearSlot(type) {
        this.truthState[type] = null;
        this.updateTruthUI();
        this.saveLevelState();
    },

    submitTruth() {
        const data = GAME_DATA[this.idx];
        const attempt = `${this.truthState.suspect}-${this.truthState.weapon}-${this.truthState.location}`;

        if (attempt === solutionToText(data.solution)) {
            this.onWin();
        } else {
            // Error feedback
            const btn = document.getElementById('btn-submit');
            btn.classList.add('shake');
            btn.style.background = 'var(--ink-cross)';
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span style="color:#fff">推理错误</span>';
            setTimeout(() => {
                btn.classList.remove('shake');
                btn.style.background = '';
                btn.innerHTML = originalText;
            }, 1500);
        }
    },

    renderClues() {
        const data = GAME_DATA[this.idx];
        document.getElementById('clue-list').innerHTML = getCaseClues(data).map((clue, idx) => `
            <div class="clue-item ${this.clueState.includes(idx) ? 'done' : ''}"
                 onclick="game.toggleClue(${idx})">
                <div class="clue-number">线索${String(idx + 1).padStart(2, '0')}</div>
                <div class="clue-text">${escapeHtml(getClueText(clue))}</div>
            </div>
        `).join('');
    },

    renderGrid(data) {
        const target = document.getElementById('grid-target');
        let h = `<table class="grid-table" id="matrix-main"><thead><tr><th style="background:var(--bg-subtle); border:none;"></th>`;
        data.suspects.forEach(s => h += `<th>${getDossierIcon(s, 'suspect', 'grid')}</th>`);
        data.locations.forEach(l => h += `<th>${getDossierIcon(l, 'location', 'grid')}</th>`);
        h += `</tr></thead><tbody>`;

        data.weapons.forEach(w => {
            h += `<tr><th>${getDossierIcon(w, 'weapon', 'grid')}</th>`;
            data.suspects.forEach(s => h += this.genCell(s.id, w.id));
            data.locations.forEach(l => h += this.genCell(w.id, l.id));
            h += `</tr>`;
        });
        data.locations.forEach(lRow => {
            h += `<tr><th>${getDossierIcon(lRow, 'location', 'grid')}</th>`;
            data.suspects.forEach(s => h += this.genCell(s.id, lRow.id));
            h += `<td colspan="${data.locations.length}" class="spacer-cell"></td></tr>`;
        });
        h += `</tbody></table>`;
        target.innerHTML = h;
        this.attachGridEvents();
    },

    genCell(rId, cId) {
        const key = `${rId}-${cId}`;
        return `<td class="cell" id="c-${key}" data-key="${key}"></td>`;
    },

    setTool(tool) {
        this.currentTool = tool;
        this.updateToolbarUI();
    },

    toggleSmartMode() {
        this.smartMode = !this.smartMode;
        this.saveGlobal();
        this.updateToolbarUI();
    },

    saveSnapshot() {
        this.snapshot = JSON.stringify(this.gridState);
        this.saveLevelState();
        this.updateToolbarUI();
        const btn = document.querySelector('.tool-btn[onclick="game.saveSnapshot()"]');
        btn.style.background = "var(--bg-active)";
        setTimeout(() => { btn.style.background = ""; }, 500);
    },

    loadSnapshot() {
        if (!this.snapshot) return;
        if (confirm("恢复笔记到暂存点？当前未保存的推理将丢失。")) {
            this.pushHistory();
            this.gridState = JSON.parse(this.snapshot);
            this.updateView();
            this.saveLevelState();
        }
    },

    updateToolbarUI() {
        ['pen', 'pencil', 'eraser'].forEach(t => {
            const el = document.getElementById(`tool-${t}`);
            if(t === this.currentTool) el.classList.add('active');
            else el.classList.remove('active');
        });

        const smartInd = document.getElementById('smart-indicator');
        if(this.smartMode) smartInd.classList.add('on'); else smartInd.classList.remove('on');

        const loadBtn = document.getElementById('btn-load-snap');
        if (this.snapshot) {
            loadBtn.removeAttribute('disabled');
            loadBtn.style.opacity = '1';
        } else {
            loadBtn.setAttribute('disabled', 'true');
            loadBtn.style.opacity = '0.5';
        }
    },

    pushHistory() {
        const stateClone = JSON.stringify(this.gridState);
        if (this.historyStack.length > 0 && this.historyStack[this.historyStack.length - 1] === stateClone) return;
        this.historyStack.push(stateClone);
        if (this.historyStack.length > 50) this.historyStack.shift();
        this.redoStack = [];
    },

    undo() {
        if (this.historyStack.length === 0) return;
        const current = JSON.stringify(this.gridState);
        this.redoStack.push(current);
        const prev = this.historyStack.pop();
        this.gridState = JSON.parse(prev);
        this.updateView();
        this.saveLevelState();
    },

    redo() {
        if (this.redoStack.length === 0) return;
        const current = JSON.stringify(this.gridState);
        this.historyStack.push(current);
        const next = this.redoStack.pop();
        this.gridState = JSON.parse(next);
        this.updateView();
        this.saveLevelState();
    },

    toggleCard(id) {
        const idx = this.eliminatedCards.indexOf(id);
        if (idx > -1) this.eliminatedCards.splice(idx, 1);
        else this.eliminatedCards.push(id);
        this.renderCards(); this.saveLevelState();
    },

    toggleClue(idx) {
        const i = this.clueState.indexOf(idx);
        if(i > -1) this.clueState.splice(i, 1);
        else this.clueState.push(idx);
        this.renderClues();
        this.saveLevelState();
    },

    interactCell(key, isDragAction = false) {
        const currentVal = this.gridState[key] || STATE.EMPTY;

        if (isDragAction) {
            if (this.currentTool === 'eraser' && currentVal !== STATE.EMPTY) {
                this.gridState[key] = STATE.EMPTY;
                this.updateView();
                this.saveLevelState();
            }
            return;
        }

        let nextVal = currentVal;
        if (this.currentTool === 'eraser') {
            nextVal = STATE.EMPTY;
        } else if (this.currentTool === 'pen') {
            if (currentVal === STATE.EMPTY || currentVal >= STATE.PENCIL_Q) nextVal = STATE.PEN_X;
            else if (currentVal === STATE.PEN_X) nextVal = STATE.PEN_V;
            else nextVal = STATE.EMPTY;
        } else if (this.currentTool === 'pencil') {
            if (currentVal === STATE.EMPTY || currentVal === STATE.PEN_X || currentVal === STATE.PEN_V) nextVal = STATE.PENCIL_Q;
            else if (currentVal === STATE.PENCIL_Q) nextVal = STATE.PENCIL_X;
            else nextVal = STATE.EMPTY;
        }

        if (nextVal !== currentVal) {
            this.pushHistory();
            this.gridState[key] = nextVal;
            if (this.smartMode && nextVal === STATE.PEN_V && this.currentTool === 'pen') {
                this.applySmartFill(key);
            }
            this.updateView();
            this.saveLevelState();
        }
    },

    applySmartFill(key) {
        const [id1, id2] = key.split('-');
        const data = GAME_DATA[this.idx];
        const cross = (k) => {
            if (this.gridState[k] !== STATE.PEN_V) {
                this.gridState[k] = STATE.PEN_X;
            }
        };
        const isSus = (i) => data.suspects.some(x => x.id === i);
        const isWea = (i) => data.weapons.some(x => x.id === i);
        const isLoc = (i) => data.locations.some(x => x.id === i);

        // Robust Smart Fill Logic
        if (isSus(id1) && isWea(id2)) {
            data.weapons.forEach(w => { if(w.id !== id2) cross(`${id1}-${w.id}`); });
            data.suspects.forEach(s => { if(s.id !== id1) cross(`${s.id}-${id2}`); });
        } else if (isSus(id1) && isLoc(id2)) {
            data.locations.forEach(l => { if(l.id !== id2) cross(`${id1}-${l.id}`); });
            data.suspects.forEach(s => { if(s.id !== id1) cross(`${s.id}-${id2}`); });
        } else if (isWea(id1) && isLoc(id2)) {
            data.locations.forEach(l => { if(l.id !== id2) cross(`${id1}-${l.id}`); });
            data.weapons.forEach(w => { if(w.id !== id1) cross(`${w.id}-${id2}`); });
        }
    },

    updateView() {
        document.querySelectorAll('.cell').forEach(td => {
            const k = td.getAttribute('data-key');
            const v = this.gridState[k] || STATE.EMPTY;
            td.setAttribute('data-state', v);
        });
    },

    attachGridEvents() {
        const table = document.getElementById('matrix-main');

        table.addEventListener('mousedown', (e) => {
            const cell = e.target.closest('td.cell');
            if (!cell || cell.classList.contains('spacer-cell')) return;

            this.isDragging = true;
            if (this.currentTool === 'eraser') this.pushHistory();
            const key = cell.getAttribute('data-key');
            this.interactCell(key, false);
        });

        table.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('td.cell');
            if (!cell || cell.classList.contains('spacer-cell')) return;

            const row = cell.parentElement;
            const colIndex = cell.cellIndex;

            Array.from(row.children).forEach(c => {
                 if(!c.classList.contains('spacer-cell')) c.classList.add('highlight-cross');
            });
            Array.from(table.rows).forEach(r => {
                if (r.children[colIndex] && !r.children[colIndex].classList.contains('spacer-cell')) {
                    r.children[colIndex].classList.add('highlight-cross');
                }
            });

            const rowHeader = row.querySelector('th');
            const colHeader = table.tHead.rows[0].cells[colIndex];

            if (rowHeader) rowHeader.classList.add('active-header');
            if (colHeader) colHeader.classList.add('active-header');

            if (this.isDragging && this.currentTool === 'eraser') {
                const key = cell.getAttribute('data-key');
                this.interactCell(key, true);
            }
        });

        table.addEventListener('mouseout', () => {
            document.querySelectorAll('.highlight-cross').forEach(el => el.classList.remove('highlight-cross'));
            document.querySelectorAll('.active-header').forEach(el => el.classList.remove('active-header'));
        });
    },

    onWin() {
        this.solvedLevels[this.idx] = true;
        this.solvedCases[this.getCaseId()] = true;
        this.saveGlobal();
        document.getElementById('btn-next').disabled = false;

        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        const isLastLevel = this.idx >= GAME_DATA.length - 1;

        let btnsHtml = `<button class="btn-modal btn-secondary" onclick="game.closeModal()">留在本案</button>`;
        if (!isLastLevel) {
            btnsHtml += `<button class="btn-modal btn-primary" onclick="game.closeModal(); game.changeLevel(1)">下一案 ▶</button>`;
        } else {
            btnsHtml += `<button class="btn-modal btn-primary" onclick="game.closeModal()">全部通关！</button>`;
        }

        document.getElementById('modal-btns').innerHTML = btnsHtml;
        this.showModal('破案成功！', '逻辑严丝合缝，真相大白。');
    },

    showModal(t, m) {
        document.getElementById('modal-title').innerText = t;
        document.getElementById('modal-msg').innerText = m;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('modal').style.display = 'block';
    },
    closeModal() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('modal').style.display = 'none';
    },
    changeLevel(off) {
        this.loadLevel(this.idx + off);
    },

    // --- Resizers & Zoom (Fully Restored) ---
    initResizers() {
        const makeResizer = (resizerId, panelId, isLeft) => {
            const resizer = document.getElementById(resizerId);
            const panel = document.getElementById(panelId);
            if (!resizer || !panel) return;

            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startW = panel.offsetWidth;

                const onMove = (mv) => {
                    const dx = mv.clientX - startX;
                    const nw = isLeft ? startW + dx : startW - dx;
                    if(nw > 200 && nw < 800) panel.style.width = nw + 'px';
                };

                const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };

                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        };
        makeResizer('resizer-left', 'dossier-panel', true);
        makeResizer('resizer-right', 'clue-panel', false);
    },

    initZoom() {
        const c = document.getElementById('matrix-container');
        c.addEventListener('wheel', (e) => {
            if(e.ctrlKey) {
                e.preventDefault();
                const d = e.deltaY > 0 ? -4 : 4;
                this.cellSize = Math.max(30, Math.min(80, this.cellSize + d));
                document.documentElement.style.setProperty('--cell-size', this.cellSize+'px');
            }
        }, {passive:false});
    }
};

window.debugSystem = debugSystem;
window.game = game;
window.startCleverGridApp = () => {
    hydrateStaticIcons();
    game.init();
};

/* js/essence.js */

// ==========================================
// GLOBAL MEMORY (For future STAT Sheet)
// ==========================================
window.playerStats = {
    orbsCollected: 0,
    finalHz: 0
};

// ==========================================
// LEVEL 1: ESSENCE DEVELOPMENT
// ==========================================
const loreData = [
    `Agni embodies an intense, consuming passion that ignites creativity and drives ambition forward with unstoppable momentum. This fierce energy easily spills over into a volatile, explosive anger when restricted, burning through boundaries with sharp impatience. Yet, beneath the aggression lies a warm, radiant joy that offers comfort, protection, and deep inspiration to those nearby. It also carries a sharp, critical judgment, fiercely cutting away falsehoods to seek absolute purity and truth. Finally, it harbors a restless anxiety, a constant, flickering fear of depletion that forces it to always seek new fuel to sustain its brilliant light.`,
    `Jala flows with profound, boundless empathy, effortlessly absorbing the unspoken emotions and hidden pains of the world. It carries a heavy, melancholic sadness, gently cradling grief like a deep, still ocean hidden away from the sun. This sorrow is balanced by a serene, tranquil peace, providing a soothing calm that heals friction and restores harmony. When disrupted, it reveals a fluid, shapeshifting insecurity, constantly adapting its form out of a deep fear of rejection or abandonment. Underneath its quiet surface, it holds a fiercely loyal, enduring love that binds relationships together with unbreakable emotional ties.`,
    `Prithvi stands as a pillar of unwavering, stubborn confidence, rooted deeply in its own unshakeable worth and massive strength. It radiates a profound, nurturing safety, offering a dependable sanctuary where others feel completely protected and grounded. This stability can harden into a rigid, heavy dullness, resisting change out of a cautious fear of the unknown. However, it experiences a quiet, deeply satisfying contentment, finding immense joy in simple, physical presence and the natural rhythm of time. It also harbors a silent, protective possessiveness, fiercely guarding its domain and the people it holds dear.`,
    `Vayu thrives on an ecstatic, untamed excitement, constantly seeking the thrill of new ideas, distant horizons, and absolute freedom. It suffers from a detached, scattered loneliness, drifting far above the world without ever feeling truly connected to a single place. Its fast, agile nature brings a lighter, whimsical curiosity that playfully explores concepts and binds people together through communication. Yet, this quickness can instantly collapse into a chaotic, overwhelming panic when it feels trapped or compressed. Ultimately, it is driven by a hopeful, soaring optimism, always looking forward to the next breeze of change.`
];

const circleConfigs = [
    { name: 'Agni', bg: '#ff0000', color: '#fff', shadow: '1px 1px 2px #000' },
    { name: 'Jala', bg: '#0000ff', color: '#fff', shadow: '1px 1px 2px #000' },
    { name: 'Prithvi', bg: '#00ff00', color: '#fff', shadow: '1px 1px 2px #000' },
    { name: 'Vayu', bg: '#ffff00', color: '#000', shadow: 'none' }
];

let selectedColorHex = '';
let chosenMazeIndex = 0;
let currentMazeGrid = null;
let chosenEntranceIndex = null;
let playerX = 0;
let playerY = 0;
let playerRadius = 3; 
let playerActive = false;
let keys = {};
let ringWidth = 0;
const ringsCount = 10;

let gameStarted = false;
let gameTimer = 300; 
let timerInterval = null;
let orbsCollectedCount = 0;
let glowTimeRemaining = 20; 
let activeOrbs = [];
let hasEnteredMaze = false;

// Global input listeners
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function startGame() {
    const titleContainer = document.getElementById('title-container');
    const startBtn = document.getElementById('start-btn');
    const bgMusic = document.getElementById('bg-music');
    const popupBox = document.getElementById('popup-box');
    
    bgMusic.play().catch(e => console.log("Audio play prevented:", e));

    titleContainer.style.transition = 'opacity 0.5s ease';
    startBtn.style.transition = 'opacity 0.5s ease';
    
    titleContainer.style.opacity = '0';
    startBtn.style.opacity = '0';
    
    setTimeout(() => {
        titleContainer.style.display = 'none';
        startBtn.style.display = 'none';
        
        popupBox.style.pointerEvents = 'auto';
        popupBox.style.opacity = '1';
    }, 500);
}

function fadeTextOut() {
    const popupContent = document.getElementById('popup-content');
    const selectionContainer = document.getElementById('selection-container');
    
    popupContent.style.opacity = '0';
    setTimeout(() => {
        popupContent.style.display = 'none';
        
        selectionContainer.style.display = 'flex';
        setTimeout(() => {
            selectionContainer.style.opacity = '1';
            
            const circles = [
                document.getElementById('circle-0'),
                document.getElementById('circle-1'),
                document.getElementById('circle-2'),
                document.getElementById('circle-3')
            ];
            
            circles.forEach((circle, index) => {
                setTimeout(() => {
                    circle.classList.add('show');
                }, index * 700);
            });
        }, 50);
    }, 1000);
}

function selectCircle(selectedIndex) {
    selectedColorHex = circleConfigs[selectedIndex].bg;
    chosenMazeIndex = selectedIndex; 
    const selectionText = document.getElementById('selection-text');
    selectionText.style.opacity = '0';

    for (let i = 0; i < 4; i++) {
        if (i !== selectedIndex) {
            const circle = document.getElementById(`circle-${i}`);
            circle.classList.add('fade-out');
        }
    }

    const selectionContainer = document.getElementById('selection-container');
    selectionContainer.style.display = 'none';

    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'block';

    const resultNode = document.getElementById('result-circle-node');
    resultNode.style.backgroundColor = circleConfigs[selectedIndex].bg;
    resultNode.style.color = circleConfigs[selectedIndex].color;
    resultNode.style.textShadow = circleConfigs[selectedIndex].shadow;
    resultNode.innerText = circleConfigs[selectedIndex].name;

    setTimeout(() => {
        const glidingCircle = document.getElementById('gliding-circle');
        glidingCircle.style.top = '30px';
        glidingCircle.style.left = '50%';
        glidingCircle.style.transform = 'translate(-50%, 0)';

        setTimeout(() => {
            const loreText = document.getElementById('lore-text');
            loreText.innerText = loreData[selectedIndex];
            loreText.style.opacity = '1';

            setTimeout(() => {
                const okayBtn = document.getElementById('okay-btn');
                okayBtn.style.opacity = '1';
                okayBtn.style.pointerEvents = 'auto';
            }, 2000 + 2000);
        }, 2500);
    }, 50);
}

function finishSelection() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.opacity = '0';
    setTimeout(() => {
        resultContainer.style.display = 'none';

        const mazeContainer = document.getElementById('maze-container');
        mazeContainer.style.display = 'flex';
        
        currentMazeGrid = buildMazeGrid();
        const outerRingIdx = currentMazeGrid.length - 1;
        let seed = (chosenMazeIndex + 1) * 9999;
        function tempRandom() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }
        chosenEntranceIndex = Math.floor(tempRandom() * currentMazeGrid[outerRingIdx].length);

        drawPacManCircularMaze(false);

        setTimeout(() => {
            mazeContainer.style.opacity = '1';

            const instructionBox = document.getElementById('maze-instruction-box');
            instructionBox.style.display = 'flex';
            instructionBox.style.pointerEvents = 'auto';
            setTimeout(() => {
                instructionBox.style.opacity = '1';
            }, 50);
        }, 50);
    }, 1000);
}

function closeMazeInstructions() {
    const instructionBox = document.getElementById('maze-instruction-box');
    instructionBox.style.opacity = '0';
    instructionBox.style.pointerEvents = 'none';
    setTimeout(() => {
        instructionBox.style.display = 'none';
        drawPacManCircularMaze(true);

        const playerCircle = document.getElementById('player-circle');
        playerCircle.style.backgroundColor = selectedColorHex;
        playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;
        playerCircle.style.left = `${playerX}px`;
        playerCircle.style.top = `${playerY}px`;
        playerCircle.style.opacity = '1';

        playerActive = true;
    }, 1000);
}

class Cell {
    constructor(ring, thetaIndex, totalThetas) {
        this.ring = ring; 
        this.thetaIndex = thetaIndex; 
        this.totalThetas = totalThetas;
        this.visited = false;
        this.walls = { inward: true, outward: true, cw: true, ccw: true };
        this.neighbors = [];
    }
}

function buildMazeGrid() {
    let grid = [];
    let seed = (chosenMazeIndex + 1) * 1337;
    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    for (let r = 0; r < ringsCount; r++) {
        let cellsInRing;
        if (r === 0) {
            cellsInRing = 1; 
        } else {
            let estimatedCells = Math.round(r * 5);
            let prevRingCount = grid[r - 1].length;
            let ratio = Math.round(estimatedCells / prevRingCount);
            cellsInRing = prevRingCount * (ratio || 1);
        }
        
        let ringCells = [];
        for (let t = 0; t < cellsInRing; t++) {
            ringCells.push(new Cell(r, t, cellsInRing));
        }
        grid.push(ringCells);
    }

    for (let r = 0; r < ringsCount; r++) {
        let ringCells = grid[r];
        for (let t = 0; t < ringCells.length; t++) {
            let cell = ringCells[t];
            
            if (ringCells.length > 1) {
                cell.neighbors.push({ cell: ringCells[(t + 1) % ringCells.length], wall: 'cw', oppWall: 'ccw' });
                cell.neighbors.push({ cell: ringCells[(t - 1 + ringCells.length) % ringCells.length], wall: 'ccw', oppWall: 'cw' });
            }
            if (r > 0) {
                let innerRing = grid[r - 1];
                let ratio = ringCells.length / innerRing.length;
                let innerIndex = Math.floor(t / ratio);
                cell.neighbors.push({ cell: innerRing[innerIndex], wall: 'inward', oppWall: 'outward' });
            }
            if (r < ringsCount - 1) {
                let outerRing = grid[r + 1];
                let ratio = outerRing.length / ringCells.length;
                let outerStart = t * ratio;
                for (let o = 0; o < ratio; o++) {
                    cell.neighbors.push({ cell: outerRing[outerStart + o], wall: 'outward', oppWall: 'inward' });
                }
            }
        }
    }

    let stack = [];
    let current = grid[0][0]; 
    current.visited = true;
    
    while (true) {
        let unvisited = current.neighbors.filter(n => !n.cell.visited);
        
        if (unvisited.length > 0) {
            let nextEdge = unvisited[Math.floor(random() * unvisited.length)];
            let nextCell = nextEdge.cell;
            
            current.walls[nextEdge.wall] = false;
            nextCell.walls[nextEdge.oppWall] = false;
            
            nextCell.visited = true;
            stack.push(current);
            current = nextCell;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }

    grid[0][0].walls.cw = false;
    grid[0][0].walls.ccw = false;
    grid0_0_inward_fix(grid);

    return grid;
}

function drawPacManCircularMaze(showEntrance) {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ringWidth = (canvas.width / 2 - 30) / ringsCount; 
    const grid = currentMazeGrid;

    const outerRingIdx = ringsCount - 1;
    if (showEntrance && chosenEntranceIndex !== null && !hasEnteredMaze) {
        grid[outerRingIdx][chosenEntranceIndex].walls.outward = false;
    } else if (hasEnteredMaze) {
        grid[outerRingIdx][chosenEntranceIndex].walls.outward = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = selectedColorHex; 
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = selectedColorHex;

    for (let r = 0; r < ringsCount; r++) {
        let ringCells = grid[r];
        let innerRadius = r * ringWidth;
        let outerRadius = (r + 1) * ringWidth;

        for (let t = 0; t < ringCells.length; t++) {
            let cell = ringCells[t];
            let startAngle = (t / cell.totalThetas) * 2 * Math.PI;
            let endAngle = ((t + 1) / cell.totalThetas) * 2 * Math.PI;

            if (showEntrance && !hasEnteredMaze && r === outerRingIdx && t === chosenEntranceIndex) {
                let midAngle = (startAngle + endAngle) / 2;
                let spawnRadius = outerRadius + 18;
                playerX = cx + spawnRadius * Math.cos(midAngle);
                playerY = cy + spawnRadius * Math.sin(midAngle);
            }

            if (cell.walls.cw && r > 0) {
                ctx.beginPath();
                ctx.moveTo(cx + innerRadius * Math.cos(endAngle), cy + innerRadius * Math.sin(endAngle));
                ctx.lineTo(cx + outerRadius * Math.cos(endAngle), cy + outerRadius * Math.sin(endAngle));
                ctx.stroke();
            }

            if (cell.walls.inward && r > 1) {
                ctx.beginPath();
                ctx.arc(cx, cy, innerRadius, startAngle, endAngle);
                ctx.stroke();
            }
            
            if (cell.walls.outward && r === ringsCount - 1) {
                ctx.beginPath();
                ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
}

function grid0_0_inward_fix(grid) {
    grid[0][0].walls.inward = false;
    if (grid[1]) {
        for (let cell of grid[1]) {
            cell.walls.inward = false;
        }
    }
}

function triggerMazeEntry() {
    hasEnteredMaze = true;
    drawPacManCircularMaze(true);
    spawnInitialOrbs();
    document.getElementById('maze-ui').style.display = 'block';
    startMainTimer();
    startGleamTimer();
}

function startMainTimer() {
    timerInterval = setInterval(() => {
        gameTimer--;
        let mins = Math.floor(gameTimer / 60);
        let secs = gameTimer % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (gameTimer <= 0) {
            clearInterval(timerInterval);
            location.reload();
        }
    }, 1000);
}

function startGleamTimer() {
    let glowInterval = setInterval(() => {
        if (!playerActive) return;
        
        glowTimeRemaining--;

        let playerCircle = document.getElementById('player-circle');
        if (glowTimeRemaining <= 5 && glowTimeRemaining > 0) {
            let opacityFactor = glowTimeRemaining / 5; 
            playerCircle.style.boxShadow = `0 0 ${Math.floor(25 * opacityFactor)}px ${selectedColorHex}`;
            playerCircle.style.opacity = opacityFactor;
        } else if (glowTimeRemaining <= 0) {
            clearInterval(glowInterval);
            playerCircle.style.opacity = '0';
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }, 1000);
}

function spawnInitialOrbs() {
    for (let i = 0; i < 5; i++) {
        spawnSingleOrb();
    }
}

function getRandomCellCoordinates() {
    const canvas = document.getElementById('mazeCanvas');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    let r = Math.floor(Math.random() * (ringsCount - 1)) + 1;
    let ringCells = currentMazeGrid[r];
    let t = Math.floor(Math.random() * ringCells.length);
    let startAngle = (t / ringCells[0].totalThetas) * 2 * Math.PI;
    let endAngle = ((t + 1) / ringCells[0].totalThetas) * 2 * Math.PI;
    let midAngle = (startAngle + endAngle) / 2;
    let midRadius = (r + 0.5) * ringWidth;

    let ox = cx + midRadius * Math.cos(midAngle);
    let oy = cy + midRadius * Math.sin(midAngle);

    let dx = ox - playerX;
    let dy = oy - playerY;
    if (Math.sqrt(dx*dx + dy*dy) < 15) {
        return getRandomCellCoordinates(); 
    }

    return { x: ox, y: oy };
}

function spawnSingleOrb() {
    let coords = getRandomCellCoordinates();
    let orbDiv = document.createElement('div');
    orbDiv.className = 'tiny-orb';
    orbDiv.style.left = `${coords.x}px`;
    orbDiv.style.top = `${coords.y}px`;
    
    document.getElementById('orbs-layer').appendChild(orbDiv);
    setTimeout(() => { orbDiv.style.opacity = '1'; }, 50);

    activeOrbs.push({ element: orbDiv, x: coords.x, y: coords.y });
}

function checkOrbCollection() {
    for (let i = activeOrbs.length - 1; i >= 0; i--) {
        let orb = activeOrbs[i];
        let dx = playerX - orb.x;
        let dy = playerY - orb.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < playerRadius + 6) {
            orb.element.remove();
            activeOrbs.splice(i, 1);

            orbsCollectedCount++;
            document.getElementById('orb-counter').innerText = orbsCollectedCount;

            glowTimeRemaining = Math.min(glowTimeRemaining + 10, 30);
            let playerCircle = document.getElementById('player-circle');
            playerCircle.style.opacity = '1';
            playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;

            spawnSingleOrb();
        }
    }
}

function checkCollision(nx, ny) {
    const canvas = document.getElementById('mazeCanvas');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = ringsCount * ringWidth;

    let dx = nx - cx;
    let dy = ny - cy;
    let distFromCenter = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    const outerRingIdx = ringsCount - 1;
    let outerCellCount = currentMazeGrid[outerRingIdx].length;
    let outerThetaIdx = Math.floor((angle / (2 * Math.PI)) * outerCellCount);
    let isOuterEntrance = (!hasEnteredMaze && outerThetaIdx === chosenEntranceIndex && !currentMazeGrid[outerRingIdx][outerThetaIdx].walls.outward);

    if (distFromCenter > maxRadius - playerRadius) {
        if (!isOuterEntrance || distFromCenter > maxRadius + 25) {
            return true;
        }
    }
    if (distFromCenter < ringWidth - playerRadius && currentMazeGrid[0][0].walls.inward) {
        return true;
    }

    let r = Math.floor(distFromCenter / ringWidth);
    if (r < 0) r = 0;
    if (r >= ringsCount) r = ringsCount - 1;

    let ringCells = currentMazeGrid[r];
    let t = Math.floor((angle / (2 * Math.PI)) * ringCells.length);
    if (t < 0) t = 0;
    if (t >= ringCells.length) t = ringCells.length - 1;

    let cell = ringCells[t];
    let startAngle = (t / cell.totalThetas) * 2 * Math.PI;
    let endAngle = ((t + 1) / cell.totalThetas) * 2 * Math.PI;

    let innerR = r * ringWidth;
    let outerR = (r + 1) * ringWidth;

    if (cell.walls.inward && distFromCenter - playerRadius < innerR && r > 0) return true;
    if (cell.walls.outward && distFromCenter + playerRadius > outerR && r < ringsCount - 1) return true;

    function normalizeAngle(a) {
        while (a < 0) a += 2 * Math.PI;
        while (a >= 2 * Math.PI) a -= 2 * Math.PI;
        return a;
    }

    let angleToStart = Math.abs(normalizeAngle(angle - startAngle));
    if (angleToStart > Math.PI) angleToStart = 2 * Math.PI - angleToStart;
    let arcDistStart = distFromCenter * angleToStart;

    let angleToEnd = Math.abs(normalizeAngle(angle - endAngle));
    if (angleToEnd > Math.PI) angleToEnd = 2 * Math.PI - angleToEnd;
    let arcDistEnd = distFromCenter * angleToEnd;

    let wallBuffer = playerRadius + 1;

    if (cell.walls.ccw && arcDistStart < wallBuffer) return true;
    if (cell.walls.cw && arcDistEnd < wallBuffer) return true;

    return false;
}

function gameLoop() {
    if (playerActive) {
        let speed = 2;
        let dx = 0;
        let dy = 0;

        if (keys['arrowup'] || keys['w']) dy -= speed;
        if (keys['arrowdown'] || keys['s']) dy += speed;
        if (keys['arrowleft'] || keys['a']) dx -= speed;
        if (keys['arrowright'] || keys['d']) dx += speed;

        if (dx !== 0 || dy !== 0) {
            let nextX = playerX + dx;
            let nextY = playerY + dy;

            if (!hasEnteredMaze) {
                const canvas = document.getElementById('mazeCanvas');
                let distToCenter = Math.sqrt((nextX - canvas.width/2)**2 + (nextY - canvas.height/2)**2);
                let maxRadius = ringsCount * ringWidth;
                
                if (distToCenter < maxRadius - playerRadius - 4) {
                    playerX = nextX;
                    playerY = nextY;
                    triggerMazeEntry();
                } else {
                    if (!checkCollision(nextX, playerY)) playerX = nextX;
                    if (!checkCollision(playerX, nextY)) playerY = nextY;
                }
            } else {
                if (!checkCollision(nextX, playerY)) playerX = nextX;
                if (!checkCollision(playerX, nextY)) playerY = nextY;

                checkOrbCollection();

                const canvas = document.getElementById('mazeCanvas');
                let distToCenter = Math.sqrt((playerX - canvas.width/2)**2 + (playerY - canvas.height/2)**2);
                
                // --- REACHED THE CENTER LOGIC ---
                if (distToCenter < ringWidth) {
                    playerActive = false;
                    clearInterval(timerInterval); // Stop timer immediately
                    
                    // Save collected stats to global memory
                    window.playerStats.orbsCollected = orbsCollectedCount;

                    // Fade out Maze & UI completely
                    const mazeContainer = document.getElementById('maze-container');
                    const mazeUI = document.getElementById('maze-ui');
                    
                    mazeContainer.style.transition = 'opacity 1.5s ease';
                    mazeUI.style.transition = 'opacity 1.5s ease';
                    
                    mazeContainer.style.opacity = '0';
                    mazeUI.style.opacity = '0';
                    
                    // After fade out completes, show transition popup
                    setTimeout(() => {
                        mazeContainer.style.display = 'none';
                        mazeUI.style.display = 'none';
                        
                        const transitionPopup = document.getElementById('transition-popup-box');
                        transitionPopup.style.display = 'flex';
                        transitionPopup.style.pointerEvents = 'auto';
                        
                        setTimeout(() => {
                            transitionPopup.style.opacity = '1';
                        }, 50);
                    }, 1500);
                }
            }

            const playerCircle = document.getElementById('player-circle');
            playerCircle.style.left = `${playerX}px`;
            playerCircle.style.top = `${playerY}px`;
        }
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


// ==========================================
// TRANSITION LOGIC
// ==========================================

function transitionToLevel2() {
    const transitionPopup = document.getElementById('transition-popup-box');
    transitionPopup.style.opacity = '0';
    transitionPopup.style.pointerEvents = 'none';
    
    // Completely fade out level 1 container
    const level1Container = document.getElementById('level1-container');
    level1Container.style.transition = 'opacity 1.5s ease';
    level1Container.style.opacity = '0';

    // Wait until level 1 is entirely invisible before beginning Level 2 fade-in
    setTimeout(() => {
        level1Container.style.display = 'none';
        transitionPopup.style.display = 'none';
        
        const level2Container = document.getElementById('level2-container');
        level2Container.style.display = 'flex';
        level2Container.style.opacity = '0';
        
        // Brief delay to register flex display before forcing opacity transition
        setTimeout(() => {
            level2Container.style.transition = 'opacity 1.5s ease';
            level2Container.style.opacity = '1';
        }, 50);
        
    }, 1500);
}


// ==========================================
// LEVEL 2: FREQUENCY TUNING
// ==========================================

const lvl2Canvas = document.getElementById("gameCanvas");
const lvl2Ctx = lvl2Canvas ? lvl2Canvas.getContext("2d") : null;

const lvl2Duration = 60;
const lvl2TileSize = 40;
const lvl2Cols = 20;
const lvl2Rows = 10;

const lvl2Player = {
    x: 60,
    y: 340,
    radius: 12,
    speed: 4,
    color: "#00ffcc"
};

let lvl2StartTime;
let lvl2TimeRemaining = lvl2Duration;
let lvl2GameActive = false;
let lvl2AnimationFrameId;

let lvl2TotalDistanceMoved = 0;
let lvl2LastPlayerX = 0;
let lvl2LastPlayerY = 0;
let lvl2PinkCollected = 0;
let lvl2BrownCollected = 0;

let lvl2MazeGrid = [];

function generateLvl2Maze() {
    lvl2MazeGrid = Array(lvl2Rows).fill().map(() => Array(lvl2Cols).fill(1));
    
    const stack = [];
    const startC = 1;
    const startR = lvl2Rows - 2;
    lvl2MazeGrid[startR][startC] = 0;
    stack.push([startR, startC]);

    while (stack.length > 0) {
        const [r, c] = stack[stack.length - 1];
        const neighbors = [];

        const directions = [[-2,0], [2,0], [0,-2], [0,2]];
        for (let [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr > 0 && nr < lvl2Rows - 1 && nc > 0 && nc < lvl2Cols - 1) {
                if (lvl2MazeGrid[nr][nc] === 1) {
                    neighbors.push([nr, nc, dr, dc]);
                }
            }
        }

        if (neighbors.length > 0) {
            const [nr, nc, dr, dc] = neighbors[Math.floor(Math.random() * neighbors.length)];
            lvl2MazeGrid[r + dr/2][c + dc/2] = 0;
            lvl2MazeGrid[nr][nc] = 0;
            stack.push([nr, nc]);
        } else {
            stack.pop();
        }
    }

    lvl2MazeGrid[8][1] = 0; lvl2MazeGrid[8][2] = 0; lvl2MazeGrid[7][1] = 0;

    let openPaths = [];
    for (let r = 1; r < lvl2Rows - 1; r++) {
        for (let c = 1; c < lvl2Cols - 1; c++) {
            if (lvl2MazeGrid[r][c] === 0 && !(c <= 2 && r >= 7)) {
                openPaths.push({r, c});
            }
        }
    }

    openPaths.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
        if (openPaths.length > 0) {
            let tile = openPaths.pop();
            lvl2MazeGrid[tile.r][tile.c] = 2;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (openPaths.length > 0) {
            let tile = openPaths.pop();
            lvl2MazeGrid[tile.r][tile.c] = 3;
        }
    }
}

function startLevel2() {
    // Keep user's chosen essence color from level 1 if available
    if (selectedColorHex) {
        lvl2Player.color = selectedColorHex;
    }

    document.getElementById("introScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    
    generateLvl2Maze();
    
    lvl2Player.x = 60;
    lvl2Player.y = 340;
    lvl2PinkCollected = 0;
    lvl2BrownCollected = 0;
    lvl2TotalDistanceMoved = 0;
    lvl2LastPlayerX = lvl2Player.x;
    lvl2LastPlayerY = lvl2Player.y;
    
    lvl2StartTime = performance.now();
    lvl2GameActive = true;
    
    lvl2GameLoop();
}

function checkLvl2Collision(nx, ny) {
    const checkPoints = [
        {x: nx - lvl2Player.radius, y: ny - lvl2Player.radius},
        {x: nx + lvl2Player.radius, y: ny - lvl2Player.radius},
        {x: nx - lvl2Player.radius, y: ny + lvl2Player.radius},
        {x: nx + lvl2Player.radius, y: ny + lvl2Player.radius}
    ];
    
    for (let p of checkPoints) {
        const gridX = Math.floor(p.x / lvl2TileSize);
        const gridY = Math.floor(p.y / lvl2TileSize);
        if (gridX < 0 || gridX >= lvl2Cols || gridY < 0 || gridY >= lvl2Rows) return true;
        if (lvl2MazeGrid[gridY][gridX] === 1) return true;
    }
    return false;
}

function updateLvl2PlayerLogic() {
    let nextX = lvl2Player.x;
    let nextY = lvl2Player.y;
    
    if (keys["arrowup"] || keys["w"]) nextY -= lvl2Player.speed;
    if (keys["arrowdown"] || keys["s"]) nextY += lvl2Player.speed;
    if (!checkLvl2Collision(lvl2Player.x, nextY)) lvl2Player.y = nextY;
    
    if (keys["arrowleft"] || keys["a"]) nextX -= lvl2Player.speed;
    if (keys["arrowright"] || keys["d"]) nextX += lvl2Player.speed;
    if (!checkLvl2Collision(nextX, lvl2Player.y)) lvl2Player.x = nextX;
    
    let dist = Math.sqrt(Math.pow(lvl2Player.x - lvl2LastPlayerX, 2) + Math.pow(lvl2Player.y - lvl2LastPlayerY, 2));
    lvl2TotalDistanceMoved += dist;
    lvl2LastPlayerX = lvl2Player.x;
    lvl2LastPlayerY = lvl2Player.y;
    
    const currentGridX = Math.floor(lvl2Player.x / lvl2TileSize);
    const currentGridY = Math.floor(lvl2Player.y / lvl2TileSize);
    
    if (currentGridY >= 0 && currentGridY < lvl2Rows && currentGridX >= 0 && currentGridX < lvl2Cols) {
        const currentTile = lvl2MazeGrid[currentGridY][currentGridX];
        if (currentTile === 2) { 
            lvl2PinkCollected++;
            lvl2MazeGrid[currentGridY][currentGridX] = 0; 
        } else if (currentTile === 3) { 
            lvl2BrownCollected++;
            lvl2MazeGrid[currentGridY][currentGridX] = 0; 
        }
    }
}

function drawLvl2Screen() {
    if (!lvl2Ctx) return;
    
    lvl2Ctx.clearRect(0, 0, lvl2Canvas.width, lvl2Canvas.height);
    
    for (let r = 0; r < lvl2Rows; r++) {
        for (let c = 0; c < lvl2Cols; c++) {
            let tx = c * lvl2TileSize;
            let ty = r * lvl2TileSize;
            
            if (lvl2MazeGrid[r][c] === 1) {
                lvl2Ctx.fillStyle = "#1e1e24";
                lvl2Ctx.fillRect(tx, ty, lvl2TileSize, lvl2TileSize);
                lvl2Ctx.strokeStyle = "#2d2d35";
                lvl2Ctx.strokeRect(tx, ty, lvl2TileSize, lvl2TileSize);
            } else if (lvl2MazeGrid[r][c] === 2) {
                lvl2Ctx.fillStyle = "#ff007f";
                lvl2Ctx.fillRect(tx, ty, lvl2TileSize, lvl2TileSize);
                lvl2Ctx.fillStyle = "#000000";
                lvl2Ctx.beginPath();
                lvl2Ctx.moveTo(tx + lvl2TileSize/2, ty + 8);
                lvl2Ctx.lineTo(tx + 8, ty + lvl2TileSize - 8);
                lvl2Ctx.lineTo(tx + lvl2TileSize - 8, ty + lvl2TileSize - 8);
                lvl2Ctx.closePath();
                lvl2Ctx.fill();
            } else if (lvl2MazeGrid[r][c] === 3) {
                lvl2Ctx.fillStyle = "#4a2c11";
                lvl2Ctx.fillRect(tx, ty, lvl2TileSize, lvl2TileSize);
                lvl2Ctx.strokeStyle = "#8c5828";
                lvl2Ctx.lineWidth = 3;
                lvl2Ctx.beginPath();
                lvl2Ctx.moveTo(tx + 5, ty + 15);
                lvl2Ctx.bezierCurveTo(tx + 15, ty + 5, tx + 25, ty + 25, tx + 35, ty + 15);
                lvl2Ctx.moveTo(tx + 5, ty + 25);
                lvl2Ctx.bezierCurveTo(tx + 15, ty + 15, tx + 25, ty + 35, tx + 35, ty + 25);
                lvl2Ctx.stroke();
            }
        }
    }
    
    lvl2Ctx.beginPath();
    lvl2Ctx.arc(lvl2Player.x, lvl2Player.y, lvl2Player.radius, 0, Math.PI * 2);
    lvl2Ctx.fillStyle = lvl2Player.color;
    lvl2Ctx.shadowBlur = 12;
    lvl2Ctx.shadowColor = lvl2Player.color;
    lvl2Ctx.fill();
    lvl2Ctx.shadowBlur = 0; 
}

function updateLvl2HUD(liveBaseline, currentMod) {
    document.getElementById("timerValue").innerText = Math.max(0, lvl2TimeRemaining).toFixed(1);
    
    let pacingString = "Low (Calm)";
    if (liveBaseline > 85) pacingString = "High (Aggressive)";
    else if (liveBaseline > 72) pacingString = "Medium (Active)";
    
    document.getElementById("pacingValue").innerText = `${pacingString} [${liveBaseline.toFixed(1)} Hz]`;
    
    let modSign = currentMod >= 0 ? "+" : "";
    document.getElementById("modValue").innerText = `${modSign}${currentMod.toFixed(1)} Hz`;
}

function calculateLvl2Metrics() {
    let movementRatio = Math.min(1, lvl2TotalDistanceMoved / 9000);
    let baselineHz = 60.0 + (movementRatio * 40.0);
    let modifierHz = (lvl2PinkCollected * 5.0) - (lvl2BrownCollected * 5.0);
    let finalHz = baselineHz + modifierHz;
    
    if (finalHz < 40) finalHz = 40;
    if (finalHz > 120) finalHz = 120;
    
    return { baselineHz, modifierHz, finalHz };
}

function handleLvl2Complete() {
    lvl2GameActive = false;
    cancelAnimationFrame(lvl2AnimationFrameId);
    
    const scores = calculateLvl2Metrics();
    window.playerStats.finalHz = scores.finalHz; // Save to global stats
    
    document.getElementById("hzDisplay").innerText = scores.finalHz.toFixed(2) + " Hz";
    document.getElementById("mathDisplay").innerHTML = `<strong>CALIBRATION SUMMARY:</strong><br> Baseline Pacing Signature: ${scores.baselineHz.toFixed(1)} Hz<br> Pink Node Modifier (${lvl2PinkCollected} collected): +${(lvl2PinkCollected * 5.0).toFixed(1)} Hz<br> Brown Node Modifier (${lvl2BrownCollected} collected): -${(lvl2BrownCollected * 5.0).toFixed(1)} Hz<br> <span style="color:#00ffcc;">Formula: ${scores.baselineHz.toFixed(1)} + ${(lvl2PinkCollected * 5.0).toFixed(1)} - ${(lvl2BrownCollected * 5.0).toFixed(1)} = ${scores.finalHz.toFixed(2)} Hz</span>`;
    
    document.getElementById("resultsScreen").style.display = "flex";
}

function lvl2GameLoop() {
    if (!lvl2GameActive) return;
    
    let elapsed = (performance.now() - lvl2StartTime) / 1000;
    lvl2TimeRemaining = lvl2Duration - elapsed;
    
    if (lvl2TimeRemaining <= 0) {
        handleLvl2Complete();
        return;
    }
    
    updateLvl2PlayerLogic();
    drawLvl2Screen();
    
    const currentLiveStats = calculateLvl2Metrics();
    updateLvl2HUD(currentLiveStats.baselineHz, currentLiveStats.modifierHz);
    
    lvl2AnimationFrameId = requestAnimationFrame(lvl2GameLoop);
}

function resetToLevel2Intro() {
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("introScreen").style.display = "flex";
    
    if (lvl2Ctx) lvl2Ctx.clearRect(0, 0, lvl2Canvas.width, lvl2Canvas.height);
    
    document.getElementById("timerValue").innerText = "60.0";
    document.getElementById("pacingValue").innerText = "Calculating...";
    document.getElementById("modValue").innerText = "0.0 Hz";
}

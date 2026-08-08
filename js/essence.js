/* js/essence.js */

// ==========================================
// GLOBAL MEMORY (For future STAT Sheet)
// ==========================================
window.playerStats = {
    element: "",
    auraColor: "",
    orbsCollected: 0,
    finalHz: 0,
    lvl3AvgRadius: 0
};

const powerRegistry = {
    'Agni': ["Flame Bolt", "Blazing Aura", "Heat Vision", "Scorching Chains", "Cinder Swarm", "Flame Forging", "Dragon Breath", "Combustion Burst", "Solar Flare", "Magma Touch", "Heat Absorption", "Pyrokinetic Flight", "Lava Manipulation", "Ember Step", "Inferno Wave", "Ash Cloak", "Firestorm", "Volcanic Eruption", "Phoenix Rebirth", "Eternal Flame"],
    'Jala': ["Water Jet", "Water Walking", "Aquatic Breathing", "Hydrokinetic Pull", "Rain Calling", "Crystal Ice Spears", "Ocean's Embrace", "Steam Burst", "Ice Shaping", "Frost Nova", "Whirlpool Creation", "Current Riding", "Purification", "Water Clone", "Glacial Prison", "Mist Form", "Healing Waters", "Tidal Wave", "Moon Tide Control", "Leviathan Summoning"],
    'Prithvi': ["Stone Skin", "Gem Sight", "Root Snare", "Vine Whips", "Thorn Barrage", "Boulder Launch", "Mud Control", "Wall of Earth", "Crystal Growth", "Nature's Healing", "Mountain Strength", "Crystal Armor", "Burrowing", "Living Forest", "Metal Shaping", "Earthquake", "Petrification", "Terrain Sculpting", "Land Renewal", "Titan's Awakening"],
    'Vayu': ["Wind Blast", "Feather Fall", "Air Sense", "Swift Current", "Air Shield", "Wind Blades", "Thunderclap", "Sound Manipulation", "Flight", "Tempest Wings", "Vacuum Sphere", "Invisibility Veil", "Lightning Strike", "Lightning Channeling", "Cloud Walking", "Pressure Crush", "Cyclone Creation", "Storm Calling", "Sky Gate", "Hurricane Manifestation"]
};

// ==========================================
// ROBUST AUDIO TRANSITION UTILITY
// ==========================================
let globalAudioFadeInterval = null;

function fadeOutAudio(callback) {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) {
        if (callback) callback();
        return;
    }

    if (globalAudioFadeInterval) {
        clearInterval(globalAudioFadeInterval);
        globalAudioFadeInterval = null;
    }

    let currentVol = bgMusic.volume;
    const fadeSteps = 20;
    const volStep = currentVol / fadeSteps;

    if (currentVol <= 0) {
        bgMusic.pause();
        if (callback) callback();
        return;
    }

    globalAudioFadeInterval = setInterval(() => {
        currentVol -= volStep;
        
        if (currentVol <= 0.05) {
            clearInterval(globalAudioFadeInterval);
            globalAudioFadeInterval = null;
            bgMusic.volume = 0;
            bgMusic.pause();
            if (callback) callback();
        } else {
            bgMusic.volume = currentVol;
        }
    }, 40);
}

function playAudio(src) {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    if (globalAudioFadeInterval) {
        clearInterval(globalAudioFadeInterval);
        globalAudioFadeInterval = null;
    }

    bgMusic.pause();
    bgMusic.src = src;
    bgMusic.loop = true;
    bgMusic.volume = 1;
    
    bgMusic.load();
    let playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Audio play error:", error);
        });
    }
}

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
    { name: 'Agni', bg: '#ff0000', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Red Aura' },
    { name: 'Jala', bg: '#0000ff', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Blue Aura' },
    { name: 'Prithvi', bg: '#00ff00', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Green Aura' },
    { name: 'Vayu', bg: '#ffff00', color: '#000', shadow: 'none', aura: 'Yellow Aura' }
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

window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;
    
    // Level 3 Rapid Tap Integration
    if (e.code === 'Space') {
        if (typeof lvl3Tap === 'function' && !e.repeat) {
            lvl3Tap();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function startGame() {
    const titleContainer = document.getElementById('title-container');
    const startBtn = document.getElementById('start-btn');
    const popupBox = document.getElementById('popup-box');
    
    playAudio('assets/That Which Anchors.mp3');

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
    
    window.playerStats.element = circleConfigs[selectedIndex].name;
    window.playerStats.auraColor = circleConfigs[selectedIndex].aura;

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
                
                if (distToCenter < ringWidth) {
                    playerActive = false;
                    clearInterval(timerInterval);
                    
                    window.playerStats.orbsCollected = orbsCollectedCount;

                    const mazeContainer = document.getElementById('maze-container');
                    const mazeUI = document.getElementById('maze-ui');
                    
                    mazeContainer.style.transition = 'opacity 1.5s ease';
                    mazeUI.style.transition = 'opacity 1.5s ease';
                    
                    mazeContainer.style.opacity = '0';
                    mazeUI.style.opacity = '0';
                    
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
// TRANSITION LOGIC L1 -> L2
// ==========================================

function transitionToLevel2() {
    const transitionPopup = document.getElementById('transition-popup-box');
    transitionPopup.style.opacity = '0';
    transitionPopup.style.pointerEvents = 'none';
    
    for (let key in keys) { keys[key] = false; }
    
    fadeOutAudio();

    const level1Container = document.getElementById('level1-container');
    level1Container.style.transition = 'opacity 1.5s ease';
    level1Container.style.opacity = '0';

    setTimeout(() => {
        level1Container.style.display = 'none';
        transitionPopup.style.display = 'none';
        
        const level2Container = document.getElementById('level2-container');
        level2Container.style.display = 'flex';
        level2Container.style.opacity = '0';
        
        setTimeout(() => {
            level2Container.style.transition = 'opacity 1.5s ease';
            level2Container.style.opacity = '1';
        }, 50);
        
    }, 1500);
}


// ==========================================
// LEVEL 2: FREQUENCY TUNING (Falling Blocks)
// ==========================================

const lvl2Canvas = document.getElementById("gameCanvas");
const lvl2Ctx = lvl2Canvas ? lvl2Canvas.getContext("2d") : null;

const lvl2Duration = 60; 
const lvl2MaxRounds = 3;

let lvl2Round = 1;
let lvl2StartTime;
let lvl2TimeRemaining = lvl2Duration;
let lvl2GameActive = false;
let lvl2AnimationFrameId;

let lvl2Blocks = [];
let lvl2Frames = 0;

let lvl2CurrentKinetic = 0;
let lvl2AccumulatedKinetic = 0;
let lvl2KineticTicks = 0;

let lvl2TotalDistanceMoved = 0;

const lvl2Player = {
    x: 400,
    y: 370,
    width: 40,
    height: 10,
    speed: 7.0,
    baseSpeed: 7.0,
    color: "#00ffcc"
};

function startLevel2() {
    if (selectedColorHex) {
        lvl2Player.color = selectedColorHex;
    }
    
    playAudio('assets/Merciless Engines.mp3');

    document.getElementById("introScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("lvl2WarningScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl2Round = 1;
    lvl2AccumulatedKinetic = 0;
    lvl2KineticTicks = 0;
    
    startLvl2Round();
}

function startLvl2Round() {
    lvl2Player.x = 400;
    lvl2Player.speed = lvl2Player.baseSpeed;
    lvl2CurrentKinetic = 0;
    lvl2TotalDistanceMoved = 0;
    
    lvl2Blocks = [];
    lvl2Frames = 0;
    
    lvl2StartTime = performance.now();
    lvl2GameActive = true;
    
    lvl2GameLoop();
}

function restartLvl2Round1() {
    document.getElementById("lvl2WarningScreen").style.display = "none";
    
    // Wipe trackers since round 1 was failed
    lvl2AccumulatedKinetic = 0;
    lvl2KineticTicks = 0;
    
    for (let key in keys) { keys[key] = false; }
    
    startLvl2Round();
}

function updateLvl2PlayerLogic() {
    let nextX = lvl2Player.x;
    let isMoving = false;
    
    if (keys["arrowleft"] || keys["a"]) {
        nextX -= lvl2Player.speed;
        isMoving = true;
    }
    if (keys["arrowright"] || keys["d"]) {
        nextX += lvl2Player.speed;
        isMoving = true;
    }
    
    // Manage Kinetic Output Bar smoothly based on current speed potential
    if (isMoving) {
        lvl2CurrentKinetic += (lvl2Player.speed * 0.1); 
    } else {
        lvl2CurrentKinetic -= 1.0; 
    }
    
    if (lvl2CurrentKinetic > 100) lvl2CurrentKinetic = 100;
    if (lvl2CurrentKinetic < 0) lvl2CurrentKinetic = 0;
    
    lvl2AccumulatedKinetic += lvl2CurrentKinetic;
    lvl2KineticTicks++;
    
    // Bounds checking
    if (nextX < 20) nextX = 20;
    if (nextX > lvl2Canvas.width - 20) nextX = lvl2Canvas.width - 20;
    
    let dist = Math.abs(lvl2Player.x - nextX);
    lvl2TotalDistanceMoved += dist;
    
    lvl2Player.x = nextX;
    
    // Slower Block Spawning (roughly 30 blocks per minute)
    lvl2Frames++;
    if (lvl2Frames % 120 === 0) {
        let isPink = Math.random() > 0.5;
        lvl2Blocks.push({
            x: Math.random() * (lvl2Canvas.width - 40) + 20,
            y: -20,
            type: isPink ? 2 : 3,
            width: 20,
            height: 20
        });
    }
    
    // Block logic (Modifiers affect speed in real-time)
    for (let i = lvl2Blocks.length - 1; i >= 0; i--) {
        let b = lvl2Blocks[i];
        b.y += 3.5; 
        
        // Collision check
        if (
            b.x < lvl2Player.x + lvl2Player.width/2 &&
            b.x + b.width > lvl2Player.x - lvl2Player.width/2 &&
            b.y < lvl2Player.y + lvl2Player.height/2 &&
            b.y + b.height > lvl2Player.y - lvl2Player.height/2
        ) {
            if (b.type === 2) {
                lvl2Player.speed += 1.5; // Pink Accelerator
            } else {
                lvl2Player.speed -= 1.5; // Brown Dampener
                if (lvl2Player.speed < 2.0) lvl2Player.speed = 2.0; // Min cap so they don't freeze
            }
            
            lvl2Blocks.splice(i, 1);
            continue;
        }
        
        if (b.y > lvl2Canvas.height) {
            lvl2Blocks.splice(i, 1);
        }
    }
}

function drawLvl2Screen() {
    if (!lvl2Ctx) return;
    
    lvl2Ctx.clearRect(0, 0, lvl2Canvas.width, lvl2Canvas.height);
    
    // Draw Blocks
    for (let b of lvl2Blocks) {
        if (b.type === 2) {
            // Pink Accelerator
            lvl2Ctx.fillStyle = "#ff007f";
            lvl2Ctx.fillRect(b.x, b.y, b.width, b.height);
            lvl2Ctx.fillStyle = "#000000";
            lvl2Ctx.beginPath();
            lvl2Ctx.moveTo(b.x + b.width/2, b.y + 4);
            lvl2Ctx.lineTo(b.x + 4, b.y + b.height - 4);
            lvl2Ctx.lineTo(b.x + b.width - 4, b.y + b.height - 4);
            lvl2Ctx.closePath();
            lvl2Ctx.fill();
        } else {
            // Brown Dampener
            lvl2Ctx.fillStyle = "#4a2c11";
            lvl2Ctx.fillRect(b.x, b.y, b.width, b.height);
            lvl2Ctx.strokeStyle = "#8c5828";
            lvl2Ctx.lineWidth = 2;
            lvl2Ctx.beginPath();
            lvl2Ctx.moveTo(b.x + 2, b.y + 7);
            lvl2Ctx.bezierCurveTo(b.x + 8, b.y + 2, b.x + 12, b.y + 12, b.x + 18, b.y + 7);
            lvl2Ctx.moveTo(b.x + 2, b.y + 13);
            lvl2Ctx.bezierCurveTo(b.x + 8, b.y + 8, b.x + 12, b.y + 18, b.x + 18, b.y + 13);
            lvl2Ctx.stroke();
        }
    }
    
    // Draw Player Paddle
    lvl2Ctx.fillStyle = lvl2Player.color;
    lvl2Ctx.shadowBlur = 10;
    lvl2Ctx.shadowColor = lvl2Player.color;
    lvl2Ctx.fillRect(lvl2Player.x - lvl2Player.width/2, lvl2Player.y - lvl2Player.height/2, lvl2Player.width, lvl2Player.height);
    lvl2Ctx.shadowBlur = 0;
}

function updateLvl2HUD() {
    document.getElementById("timerValue").innerText = Math.max(0, lvl2TimeRemaining).toFixed(1);
    document.getElementById("roundValue").innerText = `${lvl2Round}/${lvl2MaxRounds}`;
    document.getElementById("velocityValue").innerText = lvl2Player.speed.toFixed(1);
    
    // Update Kinetic Bar
    const kineticBar = document.getElementById("kineticBar");
    kineticBar.style.width = lvl2CurrentKinetic + "%";
    
    if (lvl2CurrentKinetic > 80) {
        kineticBar.style.backgroundColor = "#ff007f"; // Erratic range
    } else if (lvl2CurrentKinetic > 40) {
        kineticBar.style.backgroundColor = "#ffcc00"; // Steady range
    } else {
        kineticBar.style.backgroundColor = "#00ffcc"; // Calm range
    }
}

function handleLvl2RoundEnd() {
    lvl2GameActive = false;
    cancelAnimationFrame(lvl2AnimationFrameId);
    
    // Fail-safe logic: If player didn't move at all in Round 1
    if (lvl2Round === 1 && lvl2TotalDistanceMoved === 0) {
        document.getElementById("lvl2WarningScreen").style.display = "flex";
        return;
    }
    
    if (lvl2Round < lvl2MaxRounds) {
        lvl2Round++;
        startLvl2Round();
    } else {
        handleLvl2FinalComplete();
    }
}

function calculateLvl2FinalMetrics() {
    let avgKinetic = lvl2AccumulatedKinetic / lvl2KineticTicks;
    // Map average kinetic output (0-100) to final frequency range (40.0 - 120.0 Hz)
    let finalHz = 40.0 + (avgKinetic / 100.0) * 80.0;
    
    if (finalHz < 40) finalHz = 40;
    if (finalHz > 120) finalHz = 120;
    
    return { avgKinetic, finalHz };
}

function handleLvl2FinalComplete() {
    const scores = calculateLvl2FinalMetrics();
    window.playerStats.finalHz = scores.finalHz; 
    
    document.getElementById("hzDisplay").innerText = scores.finalHz.toFixed(2) + " Hz";
    document.getElementById("mathDisplay").innerHTML = `<strong>CALIBRATION SUMMARY:</strong><br> Average Kinetic Output: ${scores.avgKinetic.toFixed(1)}%<br> Base Velocity Range: 40.0 Hz - 120.0 Hz<br> <span style="color:#00ffcc;">Final Synthesized Frequency: ${scores.finalHz.toFixed(2)} Hz</span>`;
    
    document.getElementById("resultsScreen").style.display = "flex";
}

function lvl2GameLoop() {
    if (!lvl2GameActive) return;
    
    let elapsed = (performance.now() - lvl2StartTime) / 1000;
    lvl2TimeRemaining = lvl2Duration - elapsed;
    
    if (lvl2TimeRemaining <= 0) {
        handleLvl2RoundEnd();
        return;
    }
    
    updateLvl2PlayerLogic();
    drawLvl2Screen();
    updateLvl2HUD();
    
    lvl2AnimationFrameId = requestAnimationFrame(lvl2GameLoop);
}


// ==========================================
// TRANSITION LOGIC L2 -> L3
// ==========================================
function transitionToLevel3() {
    for (let key in keys) { keys[key] = false; }
    
    fadeOutAudio();

    const level2Container = document.getElementById('level2-container');
    level2Container.style.transition = 'opacity 1.5s ease';
    level2Container.style.opacity = '0';

    setTimeout(() => {
        level2Container.style.display = 'none';
        
        const level3Container = document.getElementById('level3-container');
        level3Container.style.display = 'flex';
        level3Container.style.opacity = '0';
        
        setTimeout(() => {
            level3Container.style.transition = 'opacity 1.5s ease';
            level3Container.style.opacity = '1';
        }, 50);
        
    }, 1500);
}


// ==========================================
// LEVEL 3: CORE STABILIZATION (Rapid Tapping)
// ==========================================
const lvl3Canvas = document.getElementById("lvl3GameCanvas");
const lvl3Ctx = lvl3Canvas ? lvl3Canvas.getContext("2d") : null;

// Bind Click Event
if (lvl3Canvas) {
    lvl3Canvas.addEventListener('mousedown', () => {
        if (lvl3GameActive) lvl3Tap();
    });
}

const lvl3GameTimeLimit = 60; 
const lvl3MaxRounds = 5;

let lvl3Round = 1;
let lvl3StartTime;
let lvl3TimeRemaining = lvl3GameTimeLimit;
let lvl3GameActive = false;
let lvl3AnimationFrameId;

// Mechanics Data
let lvl3CoreRadius = 40;
const lvl3MaxRadius = 200; 
const lvl3TapCompression = 15.0; 

// Trackers
let lvl3AvgAccumulator = 0;
let lvl3Ticks = 0;

let lvl3ElementColor = "#ff3366";

function startLevel3() {
    if (selectedColorHex) {
        lvl3ElementColor = selectedColorHex;
    }

    playAudio('assets/Voltz.mp3');

    document.getElementById("lvl3IntroScreen").style.display = "none";
    document.getElementById("lvl3FailureScreen").style.display = "none";
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl3Round = 1;
    lvl3AvgAccumulator = 0;
    lvl3Ticks = 0;
    
    startLvl3Round();
}

function startLvl3Round() {
    lvl3CoreRadius = 40;
    lvl3StartTime = performance.now();
    lvl3GameActive = true;
    lvl3GameLoop();
}

function lvl3Tap() {
    if (!lvl3GameActive) return;
    lvl3CoreRadius -= lvl3TapCompression;
    if (lvl3CoreRadius < 15) lvl3CoreRadius = 15; 
}

function updateLvl3SimulationLogic() {
    // Escalate difficulty based on round
    let expansionRates = [0.5, 0.8, 1.1, 1.5, 2.0];
    let currentExpansionRate = expansionRates[lvl3Round - 1];
    
    lvl3CoreRadius += currentExpansionRate;
    
    // Fail check
    if (lvl3CoreRadius >= lvl3MaxRadius) {
        handleLvl3Failure();
        return;
    }
    
    // Track stats continuously
    lvl3AvgAccumulator += lvl3CoreRadius;
    lvl3Ticks++;
}

function drawLvl3Graphics() {
    if (!lvl3Ctx) return;
    
    lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    const cx = lvl3Canvas.width / 2;
    const cy = lvl3Canvas.height / 2;
    
    // Draw the pulsating core
    lvl3Ctx.beginPath();
    lvl3Ctx.arc(cx, cy, lvl3CoreRadius, 0, Math.PI * 2);
    lvl3Ctx.fillStyle = lvl3ElementColor;
    lvl3Ctx.shadowBlur = 30 + (lvl3CoreRadius * 0.2);
    lvl3Ctx.shadowColor = lvl3ElementColor;
    lvl3Ctx.fill();
    lvl3Ctx.shadowBlur = 0;
    
    // Dynamic Vignette (Red glow when close to failing)
    const vignette = document.getElementById("lvl3Vignette");
    if (lvl3CoreRadius > 150) {
        let threatLevel = (lvl3CoreRadius - 150) / 50; // 0 to 1
        vignette.style.boxShadow = `inset 0 0 ${200 * threatLevel}px rgba(255, 0, 0, ${threatLevel * 0.8})`;
    } else {
        vignette.style.boxShadow = `inset 0 0 0px rgba(255, 0, 0, 0)`;
    }
}

function updateLvl3HUDMetrics() {
    document.getElementById("lvl3TimerValue").innerText = Math.max(0, lvl3TimeRemaining).toFixed(1);
    document.getElementById("lvl3RoundValue").innerText = `${lvl3Round}/5`;
    
    const integrityLabel = document.getElementById("lvl3IntegrityValue");
    if (lvl3CoreRadius > 175) {
        integrityLabel.innerText = "CRITICAL";
        integrityLabel.style.color = "#ff3366";
    } else if (lvl3CoreRadius > 120) {
        integrityLabel.innerText = "FLUCTUATING";
        integrityLabel.style.color = "#ffcc00";
    } else {
        integrityLabel.innerText = "STABLE";
        integrityLabel.style.color = "#00ffcc";
    }
}

function handleLvl3RoundEnd() {
    lvl3GameActive = false;
    cancelAnimationFrame(lvl3AnimationFrameId);
    
    if (lvl3Round < lvl3MaxRounds) {
        lvl3Round++;
        startLvl3Round();
    } else {
        handleLvl3Complete();
    }
}

function handleLvl3Failure() {
    lvl3GameActive = false;
    cancelAnimationFrame(lvl3AnimationFrameId);
    document.getElementById("lvl3FailureScreen").style.display = "flex";
}

function buildFinalStatSheet() {
    const stats = window.playerStats;
    const hz = stats.finalHz;
    
    // LEVEL 1: Base DMG Data
    let validOrbs = stats.orbsCollected;
    if (validOrbs < 1) validOrbs = 1;
    if (validOrbs > 20) validOrbs = 20;
    
    const element = stats.element || "Agni";
    const powerName = powerRegistry[element][validOrbs - 1];
    const baseDmg = validOrbs * 5; 
    
    // LEVEL 2: Accuracy Data
    let hzProfile = "";
    let accuracy = 0;
    let accuracyReason = "";
    
    if (hz <= 70.0) {
        hzProfile = "Calm";
        accuracy = 75;
        accuracyReason = "highly focused and deeply rooted emotion";
    } else if (hz <= 95.0) {
        hzProfile = "Steady";
        accuracy = 50;
        accuracyReason = "standard, controlled flow";
    } else {
        hzProfile = "Erratic";
        accuracy = 25;
        accuracyReason = "wild, unstable, and unreliable emotion";
    }
    
    // LEVEL 3: Multiplier and Drain Data
    let avgRadius = stats.lvl3AvgRadius;
    let densityLabel = "";
    let multiplier = 1.0;
    let drain = 5;
    let maxCasts = 20;
    
    if (avgRadius <= 80) {
        densityLabel = "Hyper-Dense Core (Inner Tier)";
        multiplier = 2.0;
        drain = 20;
        maxCasts = 5;
    } else if (avgRadius <= 140) {
        densityLabel = "Standard Core (Middle Tier)";
        multiplier = 1.5;
        drain = 10;
        maxCasts = 10;
    } else {
        densityLabel = "Diffused Core (Outer Tier)";
        multiplier = 1.0;
        drain = 5;
        maxCasts = 20;
    }
    
    let finalDmg = Math.floor(baseDmg * multiplier);

    let statHTML = `
============================================================<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AMPLITUDE SYNTHESIS FINALIZED<br>
============================================================<br>
 CORE ELEMENT SELECTION: ${element.toUpperCase()}<br>
 OFFENSIVE MAGIC POWER LOCKED: ${powerName.toUpperCase()}<br>
<br>
 [LEVEL 1] BASE POTENTIAL:<br>
 -> ${validOrbs} Orbs Gathered = ${baseDmg} Base DMG<br>
<br>
 [LEVEL 2] EMOTIONAL FREQUENCY:<br>
 -> ${hz.toFixed(1)} Hz (${hzProfile})<br>
 -> Hit Chance: ${accuracy}% (Due to ${accuracyReason})<br>
<br>
 [LEVEL 3] CORE DENSITY:<br>
 -> ${densityLabel} (${avgRadius.toFixed(1)}px Avg Radius)<br>
 -> Power Multiplier: x${multiplier.toFixed(1)}<br>
 -> Essence Drain: ${drain}% HP per cast<br>
<br>
 ============================================================<br>
 COMBAT OUTPUT SPECIFICATIONS:<br>
 Damage per Hit : ${finalDmg} DMG<br>
 Maximum Casts : ${maxCasts} Casts before Essence Depletion<br>
============================================================
    `;
    return statHTML;
}

function handleLvl3Complete() {
    lvl3GameActive = false;
    cancelAnimationFrame(lvl3AnimationFrameId);
    
    window.playerStats.lvl3AvgRadius = lvl3AvgAccumulator / lvl3Ticks;
    
    document.getElementById("lvl3SummaryDisplay").innerHTML = buildFinalStatSheet();
    document.getElementById("lvl3ResultsScreen").style.display = "flex";
}

function lvl3GameLoop() {
    if (!lvl3GameActive) return;
    
    let runtimeSeconds = (performance.now() - lvl3StartTime) / 1000;
    lvl3TimeRemaining = lvl3GameTimeLimit - runtimeSeconds;
    
    if (lvl3TimeRemaining <= 0) {
        handleLvl3RoundEnd();
        return;
    }
    
    updateLvl3SimulationLogic();
    drawLvl3Graphics();
    updateLvl3HUDMetrics();
    
    if (lvl3GameActive) {
        lvl3AnimationFrameId = requestAnimationFrame(lvl3GameLoop);
    }
}

function resetToLevel3Init() {
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    document.getElementById("lvl3FailureScreen").style.display = "none";
    document.getElementById("lvl3IntroScreen").style.display = "flex";
    
    if (lvl3Ctx) lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    document.getElementById("lvl3TimerValue").innerText = "60.0";
    document.getElementById("lvl3RoundValue").innerText = "1/5";
    document.getElementById("lvl3IntegrityValue").innerText = "STABLE";
    document.getElementById("lvl3IntegrityValue").style.color = "#00ffcc";
}

// ==========================================
// GUARANTEED REBOOT FALLBACK SYSTEM
// ==========================================
function rebootSystem() {
    let hasReloaded = false;
    
    fadeOutAudio(() => {
        if (!hasReloaded) {
            hasReloaded = true;
            window.location.reload();
        }
    });

    setTimeout(() => {
        if (!hasReloaded) {
            hasReloaded = true;
            window.location.reload();
        }
    }, 1500);
}

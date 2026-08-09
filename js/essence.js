/* js/essence.js */

// ==========================================
// GLOBAL MEMORY (For future STAT Sheet)
// ==========================================
window.playerStats = {
    element: "",
    elementDetail: "",
    auraColor: "",
    orbsCollected: 0,
    mazeTimeLeft: 0,
    finalHz: 0,
    finalVelocity: 0,
    avgKinetic: 0,
    lvl3AvgRadius: 0
};

const powerRegistry = {
    'Agni': [
        "Spark Snap", "Ember Dart", "Cinder Shot", "Flame Whip", "Scorch Ray",
        "Heat Wave", "Burst Strike", "Flare Blast", "Ash Bullet", "Magma Spit",
        "Fireball", "Blaze Spear", "Inferno Strike", "Combustion Burst", "Torch Slam",
        "Furnace Lance", "Volcano Eruption", "Sun Strike", "Hellfire Blast", "Supernova Core"
    ],
    'Jala': [
        "Dew Drop", "Mist Needle", "Splash Dart", "Puddle Kick", "Ripple Strike",
        "Aqua Jet", "Bubble Blast", "Stream Whip", "Frost Shard", "Water Bullet",
        "Tide Ram", "Geyser Spout", "Steam Breaker", "Ice Lance", "Tsunami Crash",
        "Glacier Smash", "Hydro Cannon", "Whirlpool Crush", "Maelstrom Burst", "Leviathan Strike"
    ],
    'Prithvi': [
        "Dust Flick", "Sand Sting", "Pebble Cast", "Dirt Kick", "Mud Slap",
        "Stone Dart", "Rock Smash", "Clay Bullet", "Gravel Blast", "Earth Spike",
        "Boulder Toss", "Quake Strike", "Geo Lance", "Tremor Slam", "Fault Crush",
        "Titan's Awakening", "Meteor Strike", "Tectonic Shatter", "Core Eruption", "Planet Crash"
    ],
    'Vayu': [
        "Breeze Flick", "Gust Dart", "Wind Slap", "Draft Strike", "Puff Blast",
        "Air Needle", "Zephyr Whip", "Gale Strike", "Squall Bullet", "Wind Blade",
        "Storm Feathers", "Cyclone Kick", "Aero Lance", "Tornado Blast", "Hurricane Strike",
        "Sky Stare", "Tempest Crush", "Typhoon Smash", "Vacuum Implosion", "Atmospheric Sever"
    ]
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
    `Your Agni Essence embodies an intense, consuming passion that ignites creativity and drives ambition forward with unstoppable momentum. This fierce energy easily spills over into a volatile, explosive anger when restricted, burning through boundaries with sharp impatience. Yet, beneath the aggression lies a warm, radiant joy that offers comfort, protection, and deep inspiration to those nearby. It also carries a sharp, critical judgment, fiercely cutting away falsehoods to seek absolute purity and truth. Finally, it harbors a restless anxiety, a constant, flickering fear of depletion that forces it to always seek new fuel to sustain its brilliant light.`,
    `Your Jala Essence flows with profound, boundless empathy, effortlessly absorbing the unspoken emotions and hidden pains of the world. It carries a heavy, melancholic sadness, gently cradling grief like a deep, still ocean hidden away from the sun. This sorrow is balanced by a serene, tranquil peace, providing a soothing calm that heals friction and restores harmony. When disrupted, it reveals a fluid, shapeshifting insecurity, constantly adapting its form out of a deep fear of rejection or abandonment. Underneath its quiet surface, it holds a fiercely loyal, enduring love that binds relationships together with unbreakable emotional ties.`,
    `Your Prithvi Essence stands as a pillar of unwavering, stubborn confidence, rooted deeply in its own unshakeable worth and massive strength. It radiates a profound, nurturing safety, offering a dependable sanctuary where others feel completely protected and grounded. This stability can harden into a rigid, heavy dullness, resisting change out of a cautious fear of the unknown. However, it experiences a quiet, deeply satisfying contentment, finding immense joy in simple, physical presence and the natural rhythm of time. It also harbors a silent, protective possessiveness, fiercely guarding its domain and the people it holds dear.`,
    `Your Vayu Essence thrives on an ecstatic, untamed excitement, constantly seeking the thrill of new ideas, distant horizons, and absolute freedom. It suffers from a detached, scattered loneliness, drifting far above the world without ever feeling truly connected to a single place. Its fast, agile nature brings a lighter, whimsical curiosity that playfully explores concepts and binds people together through communication. Yet, this quickness can instantly collapse into a chaotic, overwhelming panic when it feels trapped or compressed. Ultimately, it is driven by a hopeful, soaring optimism, always looking forward to the next breeze of change.`
];

const circleConfigs = [
    { name: 'Agni', detail: 'Agni (fire)', bg: '#ff0000', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Red Aura' },
    { name: 'Jala', detail: 'Jala (water)', bg: '#0000ff', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Blue Aura' },
    { name: 'Prithvi', detail: 'Prithvi (earth)', bg: '#00ff00', color: '#fff', shadow: '1px 1px 2px #000', aura: 'Green Aura' },
    { name: 'Vayu', detail: 'Vayu (air)', bg: '#ffff00', color: '#000', shadow: 'none', aura: 'Yellow Aura' }
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
    window.playerStats.elementDetail = circleConfigs[selectedIndex].detail;
    window.playerStats.auraColor = circleConfigs[selectedIndex].aura;

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
                    window.playerStats.mazeTimeLeft = gameTimer;

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
                        const transitionContent = document.getElementById('transition-popup-content');
                        
                        let mins = Math.floor(gameTimer / 60);
                        let secs = gameTimer % 60;
                        let timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                        transitionContent.innerHTML = `
                            <p style="font-size: 18px; color: #00ffcc; margin-bottom: 20px;">LEVEL 1: SOURCE CONNECTION ESTABLISHED</p>
                            <p>You have successfully stabilized your Energy's connection to the Source.</p>
                            <div style="background: #1a1a22; padding: 15px 25px; border-radius: 4px; border: 1px solid #b87333; margin: 20px 0; font-size: 15px; text-align: left;">
                                -> Orbs Collected: <strong>${orbsCollectedCount} / 20</strong><br>
                                -> Time Remaining: <strong>${timeStr}</strong>
                            </div>
                            <button class="btn" onclick="transitionToLevel2()">Proceed to Level 2</button>
                        `;

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
// LEVEL 2: RESONATING MAGIC
// ==========================================

const lvl2Canvas = document.getElementById("gameCanvas");
const lvl2Ctx = lvl2Canvas ? lvl2Canvas.getContext("2d") : null;

const lvl2Duration = 60; 
const lvl2MaxRounds = 4;

let lvl2Round = 1;
let lvl2StartTime;
let lvl2TimeRemaining = lvl2Duration;
let lvl2GameActive = false;
let lvl2AnimationFrameId;

let lvl2Items = [];
let lvl2Frames = 0;
let lvl2TotalFrames = 0; 

let lvl2CurrentKinetic = 0;
let lvl2AccumulatedKinetic = 0;
let lvl2KineticTicks = 0;

let bgNodes = [];

const lvl2Player = {
    x: 400,
    y: 370,
    width: 44,
    height: 12,
    speed: 7.0,
    baseSpeed: 7.0,
    color: "#00ffcc",
    overclockTimer: 0,
    glitchTimer: 0,
    trail: []
};

function initLvl2Background() {
    const bgCanvas = document.getElementById("lvl2BgCanvas");
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgNodes = [];
    
    let cx = bgCanvas.width / 2;
    let cy = bgCanvas.height / 2;

    let ringCounts = [5, 10, 15, 20, 25];
    let currentIdx = 0;
    let maxR = Math.max(cx, cy) * 1.1;

    for (let r = 0; r < ringCounts.length; r++) {
        let pointsInRing = ringCounts[r];
        let radius = (maxR / ringCounts.length) * (r + 1);

        for (let p = 0; p < pointsInRing; p++) {
            let angle = (p / pointsInRing) * Math.PI * 2;
            angle += (r % 2 === 0) ? 0 : (Math.PI / pointsInRing);

            bgNodes.push({
                id: currentIdx++,
                x: cx,
                y: cy,
                vx: 0,
                vy: 0,
                angle: angle,
                radius: radius,
                targetX: cx + Math.cos(angle) * radius,
                targetY: cy + Math.sin(angle) * radius,
                ringIndex: r
            });
        }
    }
}

function drawMandalaLines(ctx, nodes, alpha) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let n1 = nodes[i];
            let n2 = nodes[j];
            let ringDiff = Math.abs(n1.ringIndex - n2.ringIndex);
            if (ringDiff <= 1) {
                let dx = n1.x - n2.x;
                let dy = n1.y - n2.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let maxDist = (ringDiff === 0) ? (n1.radius * 2 * Math.PI / 4) : 200;
                if (dist < maxDist + 50) {
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                }
            }
        }
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

function drawLvl2Background() {
    const bgCanvas = document.getElementById("lvl2BgCanvas");
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext("2d");
    
    if (bgCanvas.width !== window.innerWidth || bgCanvas.height !== window.innerHeight) {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    let cx = bgCanvas.width / 2;
    let cy = bgCanvas.height / 2;
    let elapsed = (performance.now() - lvl2StartTime) / 1000;
    let isTransition = lvl2TimeRemaining <= 2.0 && lvl2TimeRemaining > 0;
    let transitionProgress = isTransition ? (2.0 - lvl2TimeRemaining) / 2.0 : 0;
    
    ctx.strokeStyle = selectedColorHex;
    ctx.fillStyle = selectedColorHex;
    
    if (lvl2Round === 1) {
        // ROUND 1: PLASMA -> EXPLOSION
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 20;
        
        ctx.globalAlpha = Math.random() * 0.4 + 0.1;
        ctx.beginPath();
        ctx.arc(cx, cy, 100 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                let blastSpeed = 8 + Math.random() * 10;
                n.vx = Math.cos(n.angle) * blastSpeed;
                n.vy = Math.sin(n.angle) * blastSpeed;
                n.x += n.vx;
                n.y += n.vy;
                
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                if (i % 5 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    let curX = cx;
                    let curY = cy;
                    let tempAngle = n.angle;
                    for (let j = 0; j < 5; j++) {
                        let dist = 20 + Math.random() * 40;
                        tempAngle += (Math.random() - 0.5) * 2.0;
                        curX += Math.cos(tempAngle) * dist;
                        curY += Math.sin(tempAngle) * dist;
                        ctx.lineTo(curX, curY);
                    }
                    n.x = curX;
                    n.y = curY;
                    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                    ctx.lineWidth = 2 + Math.random() * 2;
                    ctx.stroke();
                }
            }
        }
        
    } else if (lvl2Round === 2) {
        // ROUND 2: GAS (Raindrops) -> ORBIT
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 15;
        
        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                let targetAngle = Math.atan2(n.y - cy, n.x - cx);
                let tangentX = Math.cos(targetAngle + Math.PI/2) * 8;
                let tangentY = Math.sin(targetAngle + Math.PI/2) * 8;
                n.vx += (tangentX - n.vx) * 0.05;
                n.vy += (tangentY - n.vy) * 0.05;

                let currentDist = Math.sqrt((n.x - cx)**2 + (n.y - cy)**2);
                let pull = (n.radius - currentDist) * 0.05;
                n.vx += Math.cos(targetAngle) * pull;
                n.vy += Math.sin(targetAngle) * pull;

                n.x += n.vx;
                n.y += n.vy;
            } else {
                n.vx *= 0.98;
                n.vy += 0.5; 
                if(n.vy > 12) n.vy = 12;
                n.x += n.vx;
                n.y += n.vy;
                
                if (n.y > bgCanvas.height + 20) { 
                    n.y = -20; 
                    n.x = Math.random() * bgCanvas.width; 
                    n.vy = 2; 
                    n.vx = 0;
                }
            }

            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            
            if (isTransition) {
                let size = 2 + Math.sin(elapsed * 3 + i) * 2;
                if(size < 1) size = 1;
                ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(n.x, n.y - n.vy * 2);
                ctx.lineTo(n.x, n.y);
                ctx.lineWidth = 2 + Math.sin(elapsed * 3 + i) * 2;
                if(ctx.lineWidth < 1) ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
        
    } else if (lvl2Round === 3) {
        // ROUND 3: LIQUID ORBIT -> SOLID CRYSTAL
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;

        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                n.x += (n.targetX - n.x) * (0.02 + transitionProgress * 0.08);
                n.y += (n.targetY - n.y) * (0.02 + transitionProgress * 0.08);
            } else {
                let currentAngle = Math.atan2(n.y - cy, n.x - cx);
                let currentDist = Math.sqrt((n.x - cx)**2 + (n.y - cy)**2);
                currentDist += (n.radius - currentDist) * 0.05;
                
                currentAngle += 0.01 + (n.ringIndex * 0.002);
                let wobble = Math.sin(elapsed * 2 + n.id) * 15;
                
                n.x = cx + Math.cos(currentAngle) * (currentDist + wobble);
                n.y = cy + Math.sin(currentAngle) * (currentDist + wobble);
            }
            
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        let lineAlpha = isTransition ? transitionProgress * 0.2 : 0;
        if (lineAlpha > 0) {
            drawMandalaLines(ctx, bgNodes, lineAlpha);
        }

    } else if (lvl2Round === 4) {
        // ROUND 4: SOLID (Forging the Mandala)
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            n.x = n.targetX;
            n.y = n.targetY;
        }
        
        drawMandalaLines(ctx, bgNodes, 0.2);
        
        let progress = elapsed / lvl2Duration;
        let numTracers = 3;
        for(let i=0; i<numTracers; i++) {
            let tracerIndex = Math.floor((elapsed * 15 + i * 25)) % bgNodes.length;
            if (tracerIndex >= 0 && tracerIndex < bgNodes.length) {
                let tracer = bgNodes[tracerIndex];
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(tracer.x, tracer.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(tracer.x, tracer.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = selectedColorHex;
                ctx.fill();
            }
        }
    }
    
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
}

function startLevel2() {
    if (selectedColorHex) {
        lvl2Player.color = selectedColorHex;
        document.getElementById('level2-container').style.setProperty('--core-color', selectedColorHex);
    }
    
    initLvl2Background();
    
    playAudio('assets/Merciless Engines.mp3');

    document.getElementById("introScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("lvl2WarningScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl2Round = 1;
    lvl2AccumulatedKinetic = 0;
    lvl2KineticTicks = 0;
    lvl2TotalFrames = 0; 
    
    lvl2Player.speed = lvl2Player.baseSpeed;
    lvl2Player.x = 400;
    lvl2Player.overclockTimer = 0;
    lvl2Player.glitchTimer = 0;
    lvl2Player.trail = [];
    lvl2Items = [];
    
    startLvl2Round();
}

function startLvl2Round() {
    lvl2CurrentKinetic = 0;
    lvl2Frames = 0;
    
    lvl2StartTime = performance.now();
    lvl2GameActive = true;
    
    lvl2GameLoop();
}

function restartLvl2Round1() {
    document.getElementById("lvl2WarningScreen").style.display = "none";
    
    lvl2Round = 1;
    lvl2AccumulatedKinetic = 0;
    lvl2KineticTicks = 0;
    lvl2TotalFrames = 0; 
    
    initLvl2Background();
    
    lvl2Player.speed = lvl2Player.baseSpeed;
    lvl2Player.x = 400;
    lvl2Player.overclockTimer = 0;
    lvl2Player.glitchTimer = 0;
    lvl2Player.trail = [];
    lvl2Items = [];
    
    for (let key in keys) { keys[key] = false; }
    
    startLvl2Round();
}

function triggerLvl2Fail() {
    lvl2GameActive = false;
    cancelAnimationFrame(lvl2AnimationFrameId);
    
    const warningScreen = document.getElementById("lvl2WarningScreen");
    warningScreen.style.display = "flex";
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
    
    if (isMoving) {
        lvl2CurrentKinetic += (lvl2Player.speed * 0.1); 
    } else {
        lvl2CurrentKinetic -= 1.0; 
    }
    
    if (lvl2CurrentKinetic > 100) lvl2CurrentKinetic = 100;
    if (lvl2CurrentKinetic < 0) lvl2CurrentKinetic = 0;
    
    lvl2AccumulatedKinetic += lvl2CurrentKinetic;
    lvl2KineticTicks++;
    
    if (nextX < 20) nextX = 20;
    if (nextX > lvl2Canvas.width - 20) nextX = lvl2Canvas.width - 20;
    
    lvl2Player.x = nextX;
    
    // Process Animation Timers & Trails
    if (lvl2Player.overclockTimer > 0) {
        lvl2Player.overclockTimer--;
        if (isMoving) {
            lvl2Player.trail.push({x: lvl2Player.x, y: lvl2Player.y});
            if (lvl2Player.trail.length > 8) {
                lvl2Player.trail.shift();
            }
        } else if (lvl2Player.trail.length > 0) {
            lvl2Player.trail.shift();
        }
    } else if (lvl2Player.trail.length > 0) {
        lvl2Player.trail.shift();
    }

    if (lvl2Player.glitchTimer > 0) {
        lvl2Player.glitchTimer--;
    }
    
    lvl2Frames++;
    lvl2TotalFrames++; 
    
    // Smooth continuous speed scaling across the entire level
    let speedMultiplier = 1.0 + (lvl2TotalFrames / 7200); 
    
    let spawnFreq = Math.floor(120 / speedMultiplier);
    if (spawnFreq < 15) spawnFreq = 15; 
    
    let itemSpeed = 3.5 * speedMultiplier;
    let itemRadius = 12; 
    
    if (lvl2Frames % spawnFreq === 0) {
        let isSpark = Math.random() > 0.5;
        let spawnX;
        
        if (isSpark) {
            spawnX = Math.random() * (lvl2Canvas.width - 40) + 20;
        } else {
            spawnX = lvl2Player.x;
        }
        
        lvl2Items.push({
            x: spawnX,
            y: -20,
            type: isSpark ? 'spark' : 'anchor',
            radius: itemRadius,
            speed: itemSpeed
        });
    }
    
    for (let i = lvl2Items.length - 1; i >= 0; i--) {
        let item = lvl2Items[i];
        item.y += item.speed; 
        
        let dx = lvl2Player.x - item.x;
        let dy = lvl2Player.y - item.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (lvl2Player.width/2 + item.radius)) {
            if (item.type === 'spark') {
                lvl2Player.speed += 1.5; 
                lvl2Player.overclockTimer = 120; 
            } else {
                lvl2Player.speed -= 1.5; 
                lvl2Player.glitchTimer = 60; 
            }
            
            lvl2Items.splice(i, 1);
            
            if (lvl2Player.speed <= 0) {
                triggerLvl2Fail();
                return;
            }
            continue;
        }
        
        if (item.y > lvl2Canvas.height + 20) {
            lvl2Items.splice(i, 1);
        }
    }
}

function drawSynapse(ctx, x, y, radius, isPositive) {
    ctx.save();
    ctx.translate(x, y);
    
    // Background Circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    if (isPositive) {
        ctx.fillStyle = '#000000'; 
    } else {
        ctx.fillStyle = '#ffffff'; 
    }
    ctx.fill();
    
    // Symbol (+ or -)
    ctx.beginPath();
    let symbolSize = radius * 0.6;
    ctx.lineWidth = Math.max(1, radius * 0.2);
    ctx.lineCap = 'round';
    if (isPositive) {
        ctx.strokeStyle = '#ffffff'; 
        ctx.moveTo(-symbolSize, 0);
        ctx.lineTo(symbolSize, 0);
        ctx.moveTo(0, -symbolSize);
        ctx.lineTo(0, symbolSize);
    } else {
        ctx.strokeStyle = '#000000'; 
        ctx.moveTo(-symbolSize, 0);
        ctx.lineTo(symbolSize, 0);
    }
    ctx.stroke();
    
    ctx.restore();
}

function drawLvl2Screen() {
    if (!lvl2Ctx) return;
    
    lvl2Ctx.clearRect(0, 0, lvl2Canvas.width, lvl2Canvas.height);
    
    // Draw Synapses
    for (let item of lvl2Items) {
        drawSynapse(lvl2Ctx, item.x, item.y, item.radius, item.type === 'spark');
    }
    
    // Draw Hyper-Dash Trail Afterimages
    for (let i = 0; i < lvl2Player.trail.length; i++) {
        let pos = lvl2Player.trail[i];
        let alpha = (i + 1) / lvl2Player.trail.length * 0.4; 
        lvl2Ctx.fillStyle = lvl2Player.color;
        lvl2Ctx.globalAlpha = alpha;
        lvl2Ctx.fillRect(pos.x - lvl2Player.width/2, pos.y - lvl2Player.height/2, lvl2Player.width, lvl2Player.height);
    }
    lvl2Ctx.globalAlpha = 1.0;

    // Draw Main Player Object
    let px = lvl2Player.x - lvl2Player.width/2;
    let py = lvl2Player.y - lvl2Player.height/2;

    if (lvl2Player.glitchTimer > 0) {
        px += (Math.random() - 0.5) * 8; 
        py += (Math.random() - 0.5) * 4; 
        
        if (Math.random() > 0.5) {
            lvl2Ctx.fillStyle = '#888888';
        } else {
            lvl2Ctx.fillStyle = '#ffffff';
        }
    } else {
        lvl2Ctx.fillStyle = lvl2Player.color;
    }

    lvl2Ctx.shadowBlur = 10;
    lvl2Ctx.shadowColor = lvl2Player.color;
    lvl2Ctx.fillRect(px, py, lvl2Player.width, lvl2Player.height);
    lvl2Ctx.shadowBlur = 0;
}

function updateLvl2HUD() {
    document.getElementById("timerValue").innerText = Math.max(0, lvl2TimeRemaining).toFixed(1);
    document.getElementById("roundValue").innerText = `${lvl2Round}/${lvl2MaxRounds}`;
    document.getElementById("velocityValue").innerText = lvl2Player.speed.toFixed(1);
    
    const kineticBar = document.getElementById("kineticBar");
    kineticBar.style.width = lvl2CurrentKinetic + "%";
    
    if (lvl2CurrentKinetic > 80) {
        kineticBar.style.backgroundColor = "#ff007f"; 
    } else if (lvl2CurrentKinetic > 40) {
        kineticBar.style.backgroundColor = "#ffcc00"; 
    } else {
        kineticBar.style.backgroundColor = "#00ffcc"; 
    }
}

function handleLvl2RoundEnd() {
    lvl2GameActive = false;
    cancelAnimationFrame(lvl2AnimationFrameId);
    
    if (lvl2Round < lvl2MaxRounds) {
        lvl2Round++;
        startLvl2Round();
    } else {
        handleLvl2FinalComplete();
    }
}

function calculateLvl2FinalMetrics() {
    let avgKinetic = lvl2AccumulatedKinetic / lvl2KineticTicks;
    let finalHz = 40.0 + (avgKinetic / 100.0) * 80.0;
    
    if (finalHz < 40) finalHz = 40;
    if (finalHz > 120) finalHz = 120;
    
    return { avgKinetic, finalHz };
}

function handleLvl2FinalComplete() {
    const scores = calculateLvl2FinalMetrics();
    window.playerStats.finalHz = scores.finalHz; 
    window.playerStats.avgKinetic = scores.avgKinetic;
    window.playerStats.finalVelocity = lvl2Player.speed;
    
    document.getElementById("mathDisplay").innerHTML = `
        -> Average Kinetic Output: <strong>${scores.avgKinetic.toFixed(1)}%</strong><br>
        -> Base Velocity: <strong>${lvl2Player.speed.toFixed(1)}</strong>
    `;
    
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
    
    drawLvl2Background();
    updateLvl2PlayerLogic();
    drawLvl2Screen();
    updateLvl2HUD();
    
    if (lvl2GameActive) {
        lvl2AnimationFrameId = requestAnimationFrame(lvl2GameLoop);
    }
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
// LEVEL 3: RHYTHM HARMONIZATION
// ==========================================
const lvl3Canvas = document.getElementById("lvl3GameCanvas");
const lvl3Ctx = lvl3Canvas ? lvl3Canvas.getContext("2d") : null;

if (lvl3Canvas) {
    lvl3Canvas.addEventListener('mousedown', () => {
        if (lvl3GameActive) lvl3Tap();
    });
}

const lvl3RoundTimes = [15, 20, 25, 30, 60]; 
const lvl3MaxRounds = 5;

let lvl3Round = 1;
let lvl3StartTime;
let lvl3GameTimeLimit = lvl3RoundTimes[0];
let lvl3TimeRemaining = lvl3GameTimeLimit;
let lvl3GameActive = false;
let lvl3AnimationFrameId;

let lvl3CoreRadius = 40;
const lvl3MaxRadius = 200; 
const lvl3TapCompression = 15.0; 

let lvl3AvgAccumulator = 0;
let lvl3Ticks = 0;

let lvl3ElementColor = "#ff3366";

let lvl3LastTapTime = 0;

function startLevel3() {
    if (selectedColorHex) {
        lvl3ElementColor = selectedColorHex;
        document.getElementById('level3-container').style.setProperty('--core-color', selectedColorHex);
    }

    playAudio('assets/Voltz.mp3');

    document.getElementById("lvl3IntroScreen").style.display = "none";
    document.getElementById("lvl3FailureScreen").style.display = "none";
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    document.getElementById("finalDiscoveryScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl3Round = 1;
    lvl3GameTimeLimit = lvl3RoundTimes[0];
    lvl3AvgAccumulator = 0;
    lvl3Ticks = 0;
    
    startLvl3Round();
}

function startLvl3Round() {
    lvl3CoreRadius = 40;
    lvl3GameTimeLimit = lvl3RoundTimes[lvl3Round - 1];
    lvl3TimeRemaining = lvl3GameTimeLimit;
    lvl3StartTime = performance.now();
    lvl3LastTapTime = performance.now();
    lvl3GameActive = true;
    lvl3GameLoop();
}

function lvl3Tap() {
    if (!lvl3GameActive) return;
    lvl3CoreRadius -= lvl3TapCompression;
    if (lvl3CoreRadius < 15) lvl3CoreRadius = 15; 
    
    let now = performance.now();
    let timeDiff = now - lvl3LastTapTime;
    lvl3LastTapTime = now;
    
    let intensity = Math.min(timeDiff / 1500, 1.0);
    
    spawnShockwave(intensity);
}

function spawnShockwave(intensity) {
    const layer = document.getElementById('lvl3ShockwaveLayer');
    if (!layer) return;
    
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    
    wave.style.width = '400px';
    wave.style.height = '400px';
    
    let finalScale = 0.5 + (intensity * 3.5); 
    let duration = 0.6 + (intensity * 0.8); 
    let thickness = 2 + (intensity * 10);
    
    wave.style.setProperty('--max-scale', finalScale);
    wave.style.borderWidth = `${thickness}px`;
    wave.style.animation = `shockwaveExpand ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;
    
    layer.appendChild(wave);
    
    setTimeout(() => {
        if (wave.parentNode) {
            wave.parentNode.removeChild(wave);
        }
    }, duration * 1000);
}

function updateLvl3SimulationLogic() {
    let expansionRates = [0.5, 0.8, 1.0, 1.2, 1.4];
    let currentExpansionRate = expansionRates[lvl3Round - 1];
    
    lvl3CoreRadius += currentExpansionRate;
    
    if (lvl3CoreRadius >= lvl3MaxRadius) {
        handleLvl3Failure();
        return;
    }
    
    lvl3AvgAccumulator += lvl3CoreRadius;
    lvl3Ticks++;
}

function drawLvl3Graphics() {
    if (!lvl3Ctx) return;
    
    lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    const cx = lvl3Canvas.width / 2;
    const cy = lvl3Canvas.height / 2;
    
    lvl3Ctx.beginPath();
    lvl3Ctx.arc(cx, cy, lvl3CoreRadius, 0, Math.PI * 2);
    lvl3Ctx.fillStyle = lvl3ElementColor;
    lvl3Ctx.shadowBlur = 30 + (lvl3CoreRadius * 0.2);
    lvl3Ctx.shadowColor = lvl3ElementColor;
    lvl3Ctx.fill();
    lvl3Ctx.shadowBlur = 0;
    
    const vignette = document.getElementById("lvl3Vignette");
    if (lvl3CoreRadius > 150) {
        let threatLevel = (lvl3CoreRadius - 150) / 50; 
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

function handleLvl3Complete() {
    lvl3GameActive = false;
    cancelAnimationFrame(lvl3AnimationFrameId);
    
    window.playerStats.lvl3AvgRadius = lvl3AvgAccumulator / lvl3Ticks;
    
    document.getElementById("lvl3SummaryDisplay").innerHTML = `
        Core Density (Average Radius): <strong>${window.playerStats.lvl3AvgRadius.toFixed(1)} px</strong>
    `;
    document.getElementById("lvl3ResultsScreen").style.display = "flex";
}

function showFinalDiscovery() {
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    document.getElementById("finalDiscoveryDisplay").innerHTML = buildFinalDiscoverySheet();
    
    document.getElementById("finalDiscoveryHeader").style.color = selectedColorHex;
    document.getElementById("finalDiscoveryDisplay").style.color = selectedColorHex;
    
    document.getElementById("finalDiscoveryScreen").style.display = "flex";
}

function buildFinalDiscoverySheet() {
    const stats = window.playerStats;
    const hz = stats.finalHz;
    
    let validOrbs = stats.orbsCollected;
    if (validOrbs < 1) validOrbs = 1;
    if (validOrbs > 20) validOrbs = 20;
    
    const element = stats.element || "Agni";
    const elementDetail = stats.elementDetail || "Agni (fire)";
    const powerName = powerRegistry[element][validOrbs - 1];
    const baseDmg = validOrbs * 5; 
    
    // Core Density Multiplier
    let avgRadius = stats.lvl3AvgRadius;
    let multiplier = 1.0;
    if (avgRadius <= 80) {
        multiplier = 2.0;
    } else if (avgRadius <= 140) {
        multiplier = 1.5;
    } else {
        multiplier = 1.0;
    }
    
    // Coherence / Tier Mapping
    let coherenceName = "";
    let coherenceDescription = "";
    let tierIndex = 0;
    
    if (validOrbs <= 5) {
        coherenceName = "Novice";
        coherenceDescription = "you are just beginning to awaken and manifest this energy";
        tierIndex = 0;
    } else if (validOrbs <= 10) {
        coherenceName = "Adept";
        coherenceDescription = "you have a reliable grasp on this energy and can manipulate it with standard control";
        tierIndex = 1;
    } else if (validOrbs <= 15) {
        coherenceName = "Expert";
        coherenceDescription = "you possess advanced fluidity and sharpened command over this energy";
        tierIndex = 2;
    } else if (validOrbs <= 19) {
        coherenceName = "Master";
        coherenceDescription = "you hold complete, absolute mastery and profound resonance over manipulating this energy";
        tierIndex = 3;
    } else {
        coherenceName = "Perfect Master";
        coherenceDescription = "you hold complete, absolute mastery and profound resonance over manipulating this energy";
        tierIndex = 4;
    }

    // Drain % Matrix
    const drainMatrix = {
        0: { 1.0: 10, 1.5: 20, 2.0: 30 },
        1: { 1.0: 20, 1.5: 30, 2.0: 40 },
        2: { 1.0: 30, 1.5: 50, 2.0: 60 },
        3: { 1.0: 40, 1.5: 60, 2.0: 80 },
        4: { 1.0: 50, 1.5: 70, 2.0: 90 }
    };
    
    let drainPercent = drainMatrix[tierIndex][multiplier];
    
    const drainScaleText = {
        10: "a tiny amount (10%)",
        20: "a small amount (20%)",
        30: "a little (30%)",
        40: "almost half (40%)",
        50: "half (50%)",
        60: "a little over half (60%)",
        70: "a heavy amount (70%)",
        80: "a VERY draining amount (80%)",
        90: "an Extremely draining amount (90%)",
        100: "an amount that would kill you (100%)"
    };
    let drainText = drainScaleText[drainPercent];

    // Hz Vibration Mapping (Expression & Movement)
    let expressionText = "";
    let movementText = "";
    let vibrationText = "";
    let accuracy = 0;
    
    if (hz <= 70.0) {
        vibrationText = "snaps forward with absolute, pinpoint accuracy, cutting straight through the space between you and your target";
        expressionText = "locking into absolute focus";
        movementText = "snaps forward with absolute, pinpoint precision, driving cleanly toward the target";
        accuracy = 75;
    } else if (hz <= 95.0) {
        vibrationText = "maintains a standard, controlled flow, moving with a balanced rhythm and flowing smoothly into your strike without sudden distortion";
        expressionText = "grounding into a calm, practiced concentration";
        movementText = "surges forward along a steady, reliable path, maintaining balanced and controlled momentum";
        accuracy = 50;
    } else {
        vibrationText = "pulses violently, crackling with a volatile, untamed edge that makes it terrifyingly fast but hard to predict";
        expressionText = "twisting with raw, untamed intensity";
        movementText = "bursts forward with a highly destructive but erratic trajectory, sacrificing clean precision for sheer, untamed force";
        accuracy = 25;
    }

    let finalDmg = Math.floor(baseDmg * multiplier);

    // Attached Emotion text based on element
    let attachedEmotion = "";
    if (element === 'Agni') attachedEmotion = "intense, consuming passion";
    else if (element === 'Jala') attachedEmotion = "profound, boundless empathy";
    else if (element === 'Prithvi') attachedEmotion = "unwavering, stubborn confidence";
    else attachedEmotion = "ecstatic, untamed excitement";

    // Manifestation text
    let manifestationText = "";
    if (element === 'Agni') {
        if (multiplier === 2.0) manifestationText = "condenses into a blinding, hyper-focused point of white-hot pressure that shimmers with dry heat";
        else if (multiplier === 1.5) manifestationText = "tightens into a disciplined, burning focal point that radiates steady, intense heat";
        else manifestationText = "billows outward in a wide, sprawling wave, crackling with loose, ambient flames";
    } else if (element === 'Jala') {
        if (multiplier === 2.0) manifestationText = "compresses into a razor-sharp, heavy drop of hyper-dense fluid carrying immense weight";
        else if (multiplier === 1.5) manifestationText = "flows into a controlled, fluid stream that ripples with quiet, deep pressure";
        else manifestationText = "expands into a sweeping, mist-laden tide that saturates the surrounding air";
    } else if (element === 'Prithvi') {
        if (multiplier === 2.0) manifestationText = "locks into a solid, unyielding mass of compressed earth and stone-like gravity";
        else if (multiplier === 1.5) manifestationText = "grounds itself into a heavy, reliable weight that anchors your stance completely";
        else manifestationText = "spreads outward as a low, vibrating tremor that shakes the ground loosely over a wider area";
    } else {
        if (multiplier === 2.0) manifestationText = "sharpens into a piercing, compressed blade of absolute vacuum pressure";
        else if (multiplier === 1.5) manifestationText = "gathers into a brisk, focused current that hums with kinetic energy";
        else manifestationText = "billows out into a chaotic, sweeping gust of wind";
    }

    // Impact text
    let impactDescription = "";
    if (validOrbs <= 5 || multiplier === 1.0) {
        impactDescription = "leave behind superficial marks, minor burns, or light physical bruising";
    } else if (validOrbs >= 16 || multiplier === 2.0) {
        impactDescription = "blow through heavy resistance and cause severe, crippling structural or physical trauma";
    } else {
        impactDescription = "fracture standard defenses and deliver a forceful, concussive blow";
    }

    // Final Math and Text variables
    let finalVelocity = stats.finalVelocity.toFixed(1);
    let auraColor = stats.auraColor;

    let statHTML = `
============================================================<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DISCOVERY COMPLETE<br>
============================================================<br><br>
Essence Stabilized - Energy Signature Obtained<br><br>
Your Core Essence is ${elementDetail}.<br><br>
Your Offensive Magic Power is ${powerName}.<br><br>
Your understanding of this Power is ${coherenceName}, which means that ${coherenceDescription}.<br><br>
Because of the Rhythm and Frequency of your emotional state, the vibration of your Essence ${vibrationText}, and ${powerName} has a ${accuracy}% chance of connecting an attack, when used.<br><br>
Due to the density of this Energy's Core, you were able to obtain a total of ${finalDmg} DMG for ${powerName}, per connected hit.<br><br>
${powerName} will consume ${drainPercent}% of your total Essence, each time it is used (regardless if it connects or not).<br><br>
<strong>RP Application Example:</strong><br>
*You tap into your ${element} core, your body language ${expressionText} as you channel the ${attachedEmotion} within. Around you, it ${manifestationText}, glowing with a bright ${auraColor}. Shaped by your emotional Rhythm and Frequency, ${powerName} ${movementText} at a velocity of ${finalVelocity}. Once unleashed, this concentrated Energy is amplified by a ${multiplier.toFixed(1)}x core density, making it capable of delivering a final output of ${finalDmg} DMG (Base ${baseDmg} x ${multiplier.toFixed(1)}) upon contact. Depending on the target's resilience, this strike can ${impactDescription}, instantly consuming ${drainText} of your Essence to sustain the strike.*<br>
============================================================
    `;
    return statHTML;
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
    document.getElementById("finalDiscoveryScreen").style.display = "none";
    document.getElementById("lvl3IntroScreen").style.display = "flex";
    
    if (lvl3Ctx) lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    document.getElementById("lvl3TimerValue").innerText = "15.0";
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

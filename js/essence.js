/* js/essence.js */

// ==========================================
// GLOBAL MEMORY (For future STAT Sheet)
// ==========================================
window.playerStats = {
    element: "",
    auraColor: "",
    orbsCollected: 0,
    finalHz: 0,
    finalVoltage: 0
};

const spellRegistry = {
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

    // Immediately terminate any existing intervals to prevent conflicts
    if (globalAudioFadeInterval) {
        clearInterval(globalAudioFadeInterval);
        globalAudioFadeInterval = null;
    }

    let currentVol = bgMusic.volume;
    const fadeSteps = 20;
    const volStep = currentVol / fadeSteps;

    // Safety net in case volume is already 0
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

    // Aggressively kill any running fades so they don't drag the new song's volume down
    if (globalAudioFadeInterval) {
        clearInterval(globalAudioFadeInterval);
        globalAudioFadeInterval = null;
    }

    bgMusic.pause();
    bgMusic.src = src;
    bgMusic.loop = true;
    bgMusic.volume = 1;
    
    // Explicit load and play
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
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function startGame() {
    const titleContainer = document.getElementById('title-container');
    const startBtn = document.getElementById('start-btn');
    const popupBox = document.getElementById('popup-box');
    
    // Play Level 1 Music directly using safe path names
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
    
    // Fade out Level 1 Audio completely
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
    if (selectedColorHex) {
        lvl2Player.color = selectedColorHex;
    }
    
    // Play Level 2 Music securely
    playAudio('assets/Merciless Engines.mp3');

    document.getElementById("introScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
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
    window.playerStats.finalHz = scores.finalHz; 
    
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


// ==========================================
// TRANSITION LOGIC L2 -> L3
// ==========================================
function transitionToLevel3() {
    for (let key in keys) { keys[key] = false; }
    
    // Fade out Level 2 Audio completely
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
// LEVEL 3: AMPLITUDE SYNTHESIS (Power Structure)
// ==========================================
const lvl3Canvas = document.getElementById("lvl3GameCanvas");
const lvl3Ctx = lvl3Canvas ? lvl3Canvas.getContext("2d") : null;

const lvl3GameTimeLimit = 60; 
let lvl3AnimationFrameId;
let lvl3GameActive = false;

const lvl3Player = {
    x: 400,
    y: 400,
    radius: 11,
    speed: 5,
    stability: 100,
    color: "#ff3366"
};

const p1 = { x: 400, y: 40 };
const p2 = { x: 80,  y: 410 };
const p3 = { x: 720, y: 410 };

const rods = [
    { id: 0, x: p1.x, y: p1.y + 30, active: false, radius: 25 }, 
    { id: 1, x: p2.x + 35, y: p2.y - 20, active: false, radius: 25 }, 
    { id: 2, x: p3.x - 35, y: p3.y - 20, active: false, radius: 25 }  
];

let lvl3StartTime;
let lvl3TimeRemaining = lvl3GameTimeLimit;
let currentActiveRodIndex = -1;
let rodSwitchTimer = 0;

let activeDistanceTraveled = 0;
let lvl3LastPlayerX = 0;
let lvl3LastPlayerY = 0;
let activeRodAbsorptionTicks = 0;

let anomalies = [];

function isPointInTriangle(pt, v1, v2, v3) {
    let d1 = (pt.x - v2.x) * (v1.y - v2.y) - (v1.x - v2.x) * (pt.y - v2.y);
    let d2 = (pt.x - v3.x) * (v2.y - v3.y) - (v2.x - v3.x) * (pt.y - v3.y);
    let d3 = (pt.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (pt.y - v1.y);
    
    let has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    let has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(has_neg && has_pos);
}

function spawnAnomalies() {
    anomalies = [];
    for(let i=0; i<4; i++) {
        anomalies.push({
            x: 400,
            y: 220,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            radius: 8
        });
    }
}

function startLevel3() {
    if (selectedColorHex) {
        lvl3Player.color = selectedColorHex;
    }

    // Play Level 3 Music securely
    playAudio('assets/Voltz.mp3');

    document.getElementById("lvl3IntroScreen").style.display = "none";
    document.getElementById("lvl3FailureScreen").style.display = "none";
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl3Player.x = 400;
    lvl3Player.y = 350;
    lvl3Player.stability = 100;
    activeDistanceTraveled = 0;
    activeRodAbsorptionTicks = 0;
    lvl3LastPlayerX = lvl3Player.x;
    lvl3LastPlayerY = lvl3Player.y;
    
    spawnAnomalies();
    currentActiveRodIndex = Math.floor(Math.random() * 3);
    rods.forEach((r, idx) => r.active = (idx === currentActiveRodIndex));
    rodSwitchTimer = 0;
    
    lvl3StartTime = performance.now();
    lvl3GameActive = true;
    lvl3GameLoop();
}

function updateLvl3SimulationLogic() {
    let nextX = lvl3Player.x;
    let nextY = lvl3Player.y;
    
    if (keys["arrowup"] || keys["w"]) nextY -= lvl3Player.speed;
    if (keys["arrowdown"] || keys["s"]) nextY += lvl3Player.speed;
    if (keys["arrowleft"] || keys["a"]) nextX -= lvl3Player.speed;
    if (keys["arrowright"] || keys["d"]) nextX += lvl3Player.speed;
    
    if (isPointInTriangle({x: nextX, y: nextY}, p1, p2, p3)) {
        lvl3Player.x = nextX;
        lvl3Player.y = nextY;
    }
    
    let deltaMove = Math.sqrt(Math.pow(lvl3Player.x - lvl3LastPlayerX, 2) + Math.pow(lvl3Player.y - lvl3LastPlayerY, 2));
    activeDistanceTraveled += deltaMove;
    lvl3LastPlayerX = lvl3Player.x;
    lvl3LastPlayerY = lvl3Player.y;
    
    rodSwitchTimer += 1/60;
    if (rodSwitchTimer >= 4.0) {
        rodSwitchTimer = 0;
        currentActiveRodIndex = (currentActiveRodIndex + Math.floor(Math.random() * 2) + 1) % 3;
        rods.forEach((r, idx) => r.active = (idx === currentActiveRodIndex));
    }
    
    let targetRod = rods[currentActiveRodIndex];
    let distToRod = Math.sqrt(Math.pow(lvl3Player.x - targetRod.x, 2) + Math.pow(lvl3Player.y - targetRod.y, 2));
    if (distToRod <= targetRod.radius + lvl3Player.radius + 15) {
        activeRodAbsorptionTicks++;
    }
    
    anomalies.forEach(anom => {
        let nextAnomX = anom.x + anom.vx;
        let nextAnomY = anom.y + anom.vy;
        
        if (!isPointInTriangle({x: nextAnomX, y: nextAnomY}, p1, p2, p3)) {
            anom.vx *= -1;
            anom.vy *= -1;
            anom.x += anom.vx;
            anom.y += anom.vy;
        } else {
            anom.x = nextAnomX;
            anom.y = nextAnomY;
        }
        
        let distToPlayer = Math.sqrt(Math.pow(lvl3Player.x - anom.x, 2) + Math.pow(lvl3Player.y - anom.y, 2));
        if (distToPlayer < lvl3Player.radius + anom.radius) {
            lvl3Player.stability -= 0.65; 
        }
    });
    
    if (lvl3Player.stability <= 0) {
        lvl3Player.stability = 0;
        handleLvl3Failure();
    }
}

function drawLvl3Graphics() {
    if (!lvl3Ctx) return;
    
    lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    lvl3Ctx.strokeStyle = "#22222a";
    lvl3Ctx.lineWidth = 3;
    lvl3Ctx.beginPath();
    lvl3Ctx.moveTo(p1.x, p1.y);
    lvl3Ctx.lineTo(p2.x, p2.y);
    lvl3Ctx.lineTo(p3.x, p3.y);
    lvl3Ctx.closePath();
    lvl3Ctx.stroke();
    
    rods.forEach(rod => {
        lvl3Ctx.beginPath();
        lvl3Ctx.arc(rod.x, rod.y, rod.radius, 0, Math.PI * 2);
        if (rod.active) {
            lvl3Ctx.fillStyle = "rgba(255, 51, 102, 0.2)";
            lvl3Ctx.fill();
            lvl3Ctx.strokeStyle = "#ff3366";
            lvl3Ctx.lineWidth = 2;
            lvl3Ctx.shadowBlur = 15;
            lvl3Ctx.shadowColor = "#ff3366";
            lvl3Ctx.stroke();
            lvl3Ctx.shadowBlur = 0;
        } else {
            lvl3Ctx.fillStyle = "#14141c";
            lvl3Ctx.fill();
            lvl3Ctx.strokeStyle = "#333344";
            lvl3Ctx.lineWidth = 1;
            lvl3Ctx.stroke();
        }
        
        lvl3Ctx.beginPath();
        lvl3Ctx.arc(rod.x, rod.y, 4, 0, Math.PI * 2);
        lvl3Ctx.fillStyle = rod.active ? "#ff3366" : "#444";
        lvl3Ctx.fill();
    });
    
    anomalies.forEach(anom => {
        lvl3Ctx.beginPath();
        lvl3Ctx.arc(anom.x, anom.y, anom.radius, 0, Math.PI * 2);
        lvl3Ctx.fillStyle = "#00ffcc";
        lvl3Ctx.shadowBlur = 8;
        lvl3Ctx.shadowColor = "#00ffcc";
        lvl3Ctx.fill();
        lvl3Ctx.shadowBlur = 0;
    });
    
    lvl3Ctx.beginPath();
    lvl3Ctx.arc(lvl3Player.x, lvl3Player.y, lvl3Player.radius, 0, Math.PI * 2);
    lvl3Ctx.fillStyle = lvl3Player.color;
    lvl3Ctx.shadowBlur = 12;
    lvl3Ctx.shadowColor = lvl3Player.color;
    lvl3Ctx.fill();
    lvl3Ctx.shadowBlur = 0;
}

function calculateVoltageOutput() {
    let velocityRatio = Math.min(1, activeDistanceTraveled / 9500);
    let baseVoltage = 50.0 + (velocityRatio * 40.0);
    
    let surgeAddition = (activeRodAbsorptionTicks / 60) * 2.2;
    let finalVoltage = baseVoltage + surgeAddition;
    
    if (finalVoltage > 120.0) finalVoltage = 120.0;
    if (finalVoltage < 40.0) finalVoltage = 40.0;
    
    return { baseVoltage, surgeAddition, finalVoltage };
}

function updateLvl3HUDMetrics(liveVoltage) {
    document.getElementById("lvl3TimerValue").innerText = Math.max(0, lvl3TimeRemaining).toFixed(1);
    document.getElementById("stabilityBar").style.width = lvl3Player.stability + "%";
    document.getElementById("voltageValue").innerText = liveVoltage.toFixed(1) + " V";
    
    if (lvl3Player.stability < 35) {
        document.getElementById("stabilityBar").style.backgroundColor = "#ff3366";
    } else {
        document.getElementById("stabilityBar").style.backgroundColor = "#00ffcc";
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
    const v = stats.finalVoltage;
    
    let validOrbs = stats.orbsCollected;
    if (validOrbs < 1) validOrbs = 1;
    if (validOrbs > 20) validOrbs = 20;
    
    const element = stats.element || "Agni";
    const aura = stats.auraColor || "Red Aura";
    const spellName = spellRegistry[element][validOrbs - 1];
    
    let hzProfile = "";
    let hzText = "";
    if (hz <= 60.0) {
        hzProfile = "Escalating Delivery";
        hzText = `Due to a low-frequency signature of ${hz.toFixed(1)} Hz, energy pools slowly over time, building intense force the longer you refrain from firing.`;
    } else if (hz <= 100.0) {
        hzProfile = "Equilibrium Delivery";
        hzText = `Due to a stable-frequency signature of ${hz.toFixed(1)} Hz, energy tracks at standard stability with power metrics remaining fixed across usage states.`;
    } else if (hz <= 120.0) {
        hzProfile = "Volatile Burst Delivery";
        hzText = `Due to a high-frequency signature of ${hz.toFixed(1)} Hz, the structures spin up instantly but suffer high decay factors if held.`;
    } else {
        hzProfile = "Rapid Response Kinetic";
        hzText = `Due to an ultra-high frequency signature of ${hz.toFixed(1)} Hz, rapid generation speeds allow for near-instant execution with lighter direct pressure.`;
    }
    
    let vProfile = "";
    let vText = "";
    if (v < 70.0) {
        vProfile = "Dense Core Profile";
        vText = `The ${v.toFixed(1)}V amplitude calibration condenses the baseline metrics, providing an exceptionally high minimum damage floor so the elemental attack never hits softly.`;
    } else if (v < 100.0) {
        vProfile = "Standard Profile";
        vText = `The ${v.toFixed(1)}V amplitude calibration provides a balanced structural scale, maintaining standard impact rules against targets.`;
    } else {
        vProfile = "Surge Threat Multiplier";
        vText = `The ${v.toFixed(1)}V amplitude calibration grants massive energy spikes, introducing volatile critical multipliers to terminal output.`;
    }
    
    let flavorFlav = {
        'Agni': 'combustive energies out of the surrounding thermal field',
        'Jala': 'fluid dynamics out of atmospheric moisture and localized water sources',
        'Prithvi': 'dense seismic force out of the terrestrial crust',
        'Vayu': 'spinning vortex structures out of atmospheric currents'
    };
    
    let tier = validOrbs <= 5 ? "Novice" : validOrbs <= 10 ? "Adept" : validOrbs <= 15 ? "Expert" : "Master";

    let statHTML = `
============================================================<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AMPLITUDE SYNTHESIS FINALIZED<br>
============================================================<br>
 CORE ELEMENT SELECTION : ${element.toUpperCase()} (${aura} Bound)<br>
 SPELL ARCHETYPE LOCKED : ${spellName.toUpperCase()} (${stats.orbsCollected} Orbs Logged)<br>
 RESONANCE ASSIGNMENT&nbsp;&nbsp; : ${hz.toFixed(1)} Hz (${hzProfile})<br>
 AMPLITUDE COEFFICIENT&nbsp; : ${v.toFixed(1)} V (${vProfile})<br>
<br>
 STRUCTURAL LOGIC RECORD:<br>
 "Subject harnesses the ${tier} technique [${spellName}], drawing <br>
 ${flavorFlav[element]}. <br>
<br>
 ${hzText} <br>
 ${vText}"<br>
============================================================
    `;
    return statHTML;
}

function handleLvl3Complete() {
    lvl3GameActive = false;
    cancelAnimationFrame(lvl3AnimationFrameId);
    
    const scores = calculateVoltageOutput();
    window.playerStats.finalVoltage = scores.finalVoltage;
    
    document.getElementById("lvl3SummaryDisplay").innerHTML = buildFinalStatSheet();
    document.getElementById("lvl3ResultsScreen").style.display = "flex";
}

function lvl3GameLoop() {
    if (!lvl3GameActive) return;
    
    let runtimeSeconds = (performance.now() - lvl3StartTime) / 1000;
    lvl3TimeRemaining = lvl3GameTimeLimit - runtimeSeconds;
    
    if (lvl3TimeRemaining <= 0) {
        handleLvl3Complete();
        return;
    }
    
    updateLvl3SimulationLogic();
    drawLvl3Graphics();
    
    const liveCalc = calculateVoltageOutput();
    updateLvl3HUDMetrics(liveCalc.finalVoltage);
    
    lvl3AnimationFrameId = requestAnimationFrame(lvl3GameLoop);
}

function resetToLevel3Init() {
    document.getElementById("lvl3ResultsScreen").style.display = "none";
    document.getElementById("lvl3FailureScreen").style.display = "none";
    document.getElementById("lvl3IntroScreen").style.display = "flex";
    
    if (lvl3Ctx) lvl3Ctx.clearRect(0, 0, lvl3Canvas.width, lvl3Canvas.height);
    
    document.getElementById("lvl3TimerValue").innerText = "60.0";
    document.getElementById("stabilityBar").style.width = "100%";
    document.getElementById("stabilityBar").style.backgroundColor = "#00ffcc";
    document.getElementById("voltageValue").innerText = "0.0 V";
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

    // Hard fallback: If the audio engine stalls for any reason whatsoever, 
    // it will forcefully wipe and reload the browser after 1.5 seconds.
    setTimeout(() => {
        if (!hasReloaded) {
            hasReloaded = true;
            window.location.reload();
        }
    }, 1500);
}

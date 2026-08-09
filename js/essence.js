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
// LEVEL 1: ESSENCE DEVELOPMENT (PROCEDURAL INDUSTRIAL & ELEMENTAL WALLS)
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
let playerX = 220;
let playerY = 0;
let playerRadius = 3.5;
let playerActive = false;
let keys = {};

const roundTimes = [60, 120, 180]; // Round 1 = 1m, Round 2 = 2m, Round 3 = 3m
let gameTimer = 60;
let timerInterval = null;
let totalOrbsCollected = 0;
let glowTimeRemaining = 40;
let activeOrbs = [];
let lvl1Round = 1;
const lvl1MaxRounds = 3;
let hasEnteredLabyrinth = false;
let entranceCoord = { r: 0, c: 0 };

const mazeWidth = 440;
const cols = 21; 
const rows = 21;
const cellWidth = mazeWidth / cols;
let baseMazeGrid = [];

window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;
    
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
        
        lvl1Round = 1;
        totalOrbsCollected = 0;
        gameTimer = roundTimes[0];
        
        generateBraidedLabyrinth();
        setupPerimeterRound();
        drawProceduralLabyrinth(false);

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

function generateBraidedLabyrinth() {
    baseMazeGrid = Array(rows).fill(0).map(() => Array(cols).fill(1));

    let seed = (chosenMazeIndex + 1) * 777;
    function rnd() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    let stack = [];
    let startR = 1;
    let startC = 1;
    baseMazeGrid[startR][startC] = 0;
    stack.push({r: startR, c: startC});

    while(stack.length > 0) {
        let current = stack[stack.length - 1];
        let neighbors = [];
        let directions = [
            {dr: -2, dc: 0}, {dr: 2, dc: 0},
            {dr: 0, dc: -2}, {dr: 0, dc: 2}
        ];

        for (let d of directions) {
            let nr = current.r + d.dr;
            let nc = current.c + d.dc;
            if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1) {
                if (baseMazeGrid[nr][nc] === 1) {
                    neighbors.push({r: nr, c: nc, dr: d.dr, dc: d.dc});
                }
            }
        }

        if (neighbors.length > 0) {
            neighbors.sort(() => rnd() - 0.5);
            let next = neighbors[0];
            baseMazeGrid[current.r + next.dr / 2][current.c + next.dc / 2] = 0;
            baseMazeGrid[next.r][next.c] = 0;
            stack.push({r: next.r, c: next.c});
        } else {
            stack.pop();
        }
    }

    let internalWalls = [];
    for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
            if (baseMazeGrid[r][c] === 1) {
                internalWalls.push({r: r, c: c});
            }
        }
    }
    internalWalls.sort(() => rnd() - 0.5);
    let wallsToKnock = Math.floor(internalWalls.length * 0.15);
    for (let i = 0; i < wallsToKnock; i++) {
        let w = internalWalls[i];
        baseMazeGrid[w.r][w.c] = 0;
    }

    let midR = Math.floor(rows / 2);
    let midC = Math.floor(cols / 2);
    for (let r = midR - 1; r <= midR + 1; r++) {
        for (let c = midC - 1; c <= midC + 1; c++) {
            baseMazeGrid[r][c] = 0;
        }
    }
}

function getRotatedGrid(grid, rotationCount) {
    let res = JSON.parse(JSON.stringify(grid));
    for (let rot = 0; rot < rotationCount; rot++) {
        let n = res.length;
        let ret = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                ret[c][n - 1 - r] = res[r][c];
            }
        }
        res = ret;
    }
    return res;
}

function setupPerimeterRound() {
    hasEnteredLabyrinth = false;
    let basePos = chosenMazeIndex; // 0: Agni, 1: Jala, 2: Prithvi, 3: Vayu
    let currentPos = (basePos + (lvl1Round - 1)) % 4; // Rotates 90 deg clockwise per round

    let targetRow = 0, targetCol = Math.floor(cols / 2);
    if (currentPos === 0) { targetRow = 0; targetCol = Math.floor(cols / 2); }
    else if (currentPos === 1) { targetRow = Math.floor(rows / 2); targetCol = 0; }
    else if (currentPos === 2) { targetRow = rows - 1; targetCol = Math.floor(cols / 2); }
    else if (currentPos === 3) { targetRow = Math.floor(rows / 2); targetCol = cols - 1; }

    entranceCoord = { r: targetRow, c: targetCol };

    // Clear entrance cell so door is open
    let activeGrid = getRotatedGrid(baseMazeGrid, lvl1Round - 1);
    activeGrid[entranceCoord.r][entranceCoord.c] = 0;

    // Position player cleanly outside the perimeter wall
    if (currentPos === 0) {
        playerX = targetCol * cellWidth + cellWidth / 2;
        playerY = -14; 
    } else if (currentPos === 1) {
        playerX = -14; 
        playerY = targetRow * cellWidth + cellWidth / 2;
    } else if (currentPos === 2) {
        playerX = targetCol * cellWidth + cellWidth / 2;
        playerY = mazeWidth + 14; 
    } else {
        playerX = mazeWidth + 14; 
        playerY = targetRow * cellWidth + cellWidth / 2;
    }
}

// Procedural Industrial/Elemental Texturing per Element & Wall Type
function drawProceduralLabyrinth(sealed) {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeGrid = getRotatedGrid(baseMazeGrid, lvl1Round - 1);
    if (sealed) {
        activeGrid[entranceCoord.r][entranceCoord.c] = 1; // Snap entrance door shut
    }

    ctx.save();
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let isPerimeter = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1);
            let isWall = (activeGrid[r][c] === 1);
            let x = c * cellWidth;
            let y = r * cellWidth;

            if (isWall) {
                ctx.save();
                ctx.translate(x, y);

                if (chosenMazeIndex === 0) {
                    // AGNI: Lava outside perimeter, hardened Magma/Obsidian inside walls
                    if (isPerimeter) {
                        ctx.fillStyle = '#b32400';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.fillStyle = '#ff471a';
                        ctx.fillRect(3, 3, cellWidth - 6, cellWidth - 6);
                        ctx.fillStyle = '#ffcc00';
                        ctx.fillRect(cellWidth/2 - 2, cellWidth/2 - 2, 4, 4);
                    } else {
                        ctx.fillStyle = '#261a14';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#b33600';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(1, 1, cellWidth - 2, cellWidth - 2);
                        ctx.fillStyle = '#ff3300';
                        ctx.fillRect(cellWidth/2 - 1.5, cellWidth/2 - 1.5, 3, 3);
                    }
                } else if (chosenMazeIndex === 1) {
                    // JALA: Thick Frost/Ice outside perimeter, cascading Water/Fluid streams inside walls
                    if (isPerimeter) {
                        ctx.fillStyle = '#b3d9ff';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(2, 2, cellWidth - 4, cellWidth - 4);
                    } else {
                        ctx.fillStyle = '#003366';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#3399ff';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(cellWidth/2, 0);
                        ctx.lineTo(cellWidth/2, cellWidth);
                        ctx.stroke();
                    }
                } else if (chosenMazeIndex === 2) {
                    // PRITHVI: Weathered Ancient Stone outside, organic Vine & Root plant walls inside
                    if (isPerimeter) {
                        ctx.fillStyle = '#595959';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#383838';
                        ctx.strokeRect(1, 1, cellWidth - 2, cellWidth - 2);
                    } else {
                        ctx.fillStyle = '#264d00';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#66cc00';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(cellWidth/2, cellWidth/2, cellWidth/3, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else if (chosenMazeIndex === 3) {
                    // VAYU: Weathered Brass & Iron outside, Compressed Steam / Pneumatic Pipe walls inside
                    if (isPerimeter) {
                        ctx.fillStyle = '#996633';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#cc9900';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(1, 1, cellWidth - 2, cellWidth - 2);
                    } else {
                        ctx.fillStyle = '#404040';
                        ctx.fillRect(0, 0, cellWidth, cellWidth);
                        ctx.strokeStyle = '#b3b3b3';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(3, 3, cellWidth - 6, cellWidth - 6);
                        ctx.fillStyle = '#e6e6e6';
                        ctx.fillRect(cellWidth/2 - 2, cellWidth/2 - 2, 4, 4);
                    }
                }

                ctx.restore();
            }
        }
    }

    // Highlight Central Chamber Destination (Steampunk Core Mechanism aesthetic)
    let midR = Math.floor(rows / 2);
    let midC = Math.floor(cols / 2);
    let cx = (midC - 1) * cellWidth;
    let cy = (midR - 1) * cellWidth;
    let cSize = cellWidth * 3;

    ctx.fillStyle = '#2b1d0c';
    ctx.fillRect(cx, cy, cSize, cSize);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, cy, cSize, cSize);

    // Inner brass gear/core marker
    ctx.beginPath();
    ctx.arc(cx + cSize/2, cy + cSize/2, cellWidth * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
}

function closeMazeInstructions() {
    const instructionBox = document.getElementById('maze-instruction-box');
    instructionBox.style.opacity = '0';
    instructionBox.style.pointerEvents = 'none';
    setTimeout(() => {
        instructionBox.style.display = 'none';
        drawTrueLabyrinth(false);

        const playerCircle = document.getElementById('player-circle');
        playerCircle.style.backgroundColor = selectedColorHex;
        playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;
        playerCircle.style.left = `${playerX}px`;
        playerCircle.style.top = `${playerY}px`;
        playerCircle.style.opacity = '1';

        playerActive = true;
    }, 1000);
}

function startMainTimer() {
    timerInterval = setInterval(() => {
        gameTimer--;
        let mins = Math.floor(gameTimer / 60);
        let secs = gameTimer % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (gameTimer <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            location.reload();
        }
    }, 1000);
}

function startGleamTimer() {
    let glowInterval = setInterval(() => {
        if (!playerActive) return;
        
        glowTimeRemaining--;

        let playerCircle = document.getElementById('player-circle');
        if (glowTimeRemaining <= 10 && glowTimeRemaining > 0) {
            let opacityFactor = glowTimeRemaining / 10; 
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
    for (let i = 0; i < 6; i++) {
        spawnSingleOrb();
    }
}

function spawnSingleOrb() {
    let activeGrid = getRotatedGrid(baseMazeGrid, lvl1Round - 1);
    let rx, ry, valid = false;
    
    while (!valid) {
        let c = Math.floor(Math.random() * (cols - 4)) + 2;
        let r = Math.floor(Math.random() * (rows - 4)) + 2;
        if (activeGrid[r][c] === 0) {
            rx = c * cellWidth + cellWidth / 2;
            ry = r * cellWidth + cellWidth / 2;
            valid = true;
        }
    }

    let orbDiv = document.createElement('div');
    orbDiv.className = 'tiny-orb';
    orbDiv.style.left = `${rx}px`;
    orbDiv.style.top = `${ry}px`;
    
    document.getElementById('orbs-layer').appendChild(orbDiv);
    setTimeout(() => { orbDiv.style.opacity = '1'; }, 50);

    activeOrbs.push({ element: orbDiv, x: rx, y: ry });
}

function checkOrbCollection() {
    for (let i = activeOrbs.length - 1; i >= 0; i--) {
        let orb = activeOrbs[i];
        let dx = playerX - orb.x;
        let dy = playerY - orb.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < playerRadius + 8) {
            orb.element.remove();
            activeOrbs.splice(i, 1);

            totalOrbsCollected++;
            document.getElementById('orb-counter').innerText = totalOrbsCollected;

            glowTimeRemaining = Math.min(glowTimeRemaining + 15, 45);
            let playerCircle = document.getElementById('player-circle');
            playerCircle.style.opacity = '1';
            playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;

            spawnSingleOrb();
        }
    }
}

function checkWallCollision(x, y) {
    let activeGrid = getRotatedGrid(baseMazeGrid, lvl1Round - 1);
    // If player hasn't entered yet, entrance door is open
    if (!hasEnteredLabyrinth) {
        activeGrid[entranceCoord.r][entranceCoord.c] = 0;
    }
    let c = Math.floor(x / cellWidth);
    let r = Math.floor(y / cellWidth);

    if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
    return activeGrid[r][c] === 1;
}

function gameLoop() {
    if (playerActive) {
        let baseSpeed = 2.0;
        let rawDx = 0;
        let rawDy = 0;

        if (keys['arrowup'] || keys['w']) rawDy -= baseSpeed;
        if (keys['arrowdown'] || keys['s']) rawDy += baseSpeed;
        if (keys['arrowleft'] || keys['a']) rawDx -= baseSpeed;
        if (keys['arrowright'] || keys['d']) rawDx += baseSpeed;

        if (rawDx !== 0 || rawDy !== 0) {
            let slipFactor = 0.35;
            let slipX = (Math.random() - 0.5) * slipFactor * baseSpeed;
            let slipY = (Math.random() - 0.5) * slipFactor * baseSpeed;

            let nextX = playerX + rawDx + slipX;
            let nextY = playerY + rawDy + slipY;

            // Strict collision check across the board
            if (!checkWallCollision(nextX, nextY)) {
                playerX = nextX;
                playerY = nextY;
            } else {
                if (!checkWallCollision(nextX, playerY)) playerX = nextX;
                if (!checkWallCollision(playerX, nextY)) playerY = nextY;
            }

            // Check if player crossed threshold from outside into the labyrinth interior
            if (!hasEnteredLabyrinth) {
                let ec = entranceCoord.c * cellWidth;
                let er = entranceCoord.r * cellWidth;
                // If player is now inside the maze bounds and past the perimeter edge
                if (playerX >= 10 && playerX <= mazeWidth - 10 && playerY >= 10 && playerY <= mazeWidth - 10) {
                    hasEnteredLabyrinth = true;
                    drawTrueLabyrinth(true); // Snap entrance door shut behind player
                    document.getElementById('maze-ui').style.display = 'block';
                    startMainTimer();
                    startGleamTimer();
                    spawnInitialOrbs();
                }
            } else {
                checkOrbCollection();
            }

            // Check if player reached the central chamber destination
            let midR = Math.floor(rows / 2);
            let midC = Math.floor(cols / 2);
            let chamberMinX = (midC - 1) * cellWidth;
            let chamberMaxX = (midC + 2) * cellWidth;
            let chamberMinY = (midR - 1) * cellWidth;
            let chamberMaxY = (midR + 2) * cellWidth;

            if (hasEnteredLabyrinth && playerX >= chamberMinX && playerX <= chamberMaxX &&
                playerY >= chamberMinY && playerY <= chamberMaxY) {
                
                playerActive = false;
                activeOrbs.forEach(o => o.element.remove());
                activeOrbs = [];

                if (lvl1Round < lvl1MaxRounds) {
                    lvl1Round++;
                    gameTimer = roundTimes[lvl1Round - 1]; // Round duration: 1m, 2m, 3m
                    glowTimeRemaining = 40;
                    setupPerimeterRound();
                    document.getElementById('lvl1-round-display').innerText = lvl1Round;
                    
                    let mins = Math.floor(gameTimer / 60);
                    let secs = gameTimer % 60;
                    document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                    drawTrueLabyrinth(false);

                    const playerCircle = document.getElementById('player-circle');
                    playerCircle.style.left = `${playerX}px`;
                    playerCircle.style.top = `${playerY}px`;
                    playerCircle.style.opacity = '1';
                    playerActive = true;
                } else {
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }

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
                        
                        let finalCalculatedOrbs = Math.round(totalOrbsCollected / 4);
                        if (finalCalculatedOrbs < 1) finalCalculatedOrbs = 1;
                        if (finalCalculatedOrbs > 20) finalCalculatedOrbs = 20;
                        window.playerStats.orbsCollected = finalCalculatedOrbs;

                        transitionContent.innerHTML = `
                            <p style="font-size: 18px; color: #00ffcc; margin-bottom: 20px;">LEVEL 1: SOURCE CONNECTION ESTABLISHED</p>
                            <p>You have successfully navigated all 3 complex rotating labyrinth rounds.</p>
                            <div style="background: #1a1a22; padding: 15px 25px; border-radius: 4px; border: 1px solid #b87333; margin: 20px 0; font-size: 15px; text-align: left;">
                                -> Total Orbs Collected: <strong>${totalOrbsCollected}</strong><br>
                                -> Final Calculated Power Rating (Total ÷ 4): <strong>${finalCalculatedOrbs}</strong>
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
        }

        // AURA TREMOR JITTER
        let jitterX = (Math.random() - 0.5) * 4;
        let jitterY = (Math.random() - 0.5) * 4;

        const playerCircle = document.getElementById('player-circle');
        playerCircle.style.left = `${playerX + jitterX}px`;
        playerCircle.style.top = `${playerY + jitterY}px`;
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

window.mandalaParams = {
    petals: 8,
    layers: 4,
    maxRadius: 200
};

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

    window.mandalaParams = {
        petals: Math.floor(Math.random() * 7) + 6, 
        layers: Math.floor(Math.random() * 3) + 3, 
        maxRadius: Math.min(bgCanvas.width, bgCanvas.height) * 0.4
    };

    for(let i=0; i<75; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = 4 + Math.random() * 6;
        bgNodes.push({
            id: i,
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: angle,
            theta: Math.random() * Math.PI * 2,
            radius: Math.random() * 200,
            ringIndex: i % 5
        });
    }
}

function drawSolidMandala(ctx, cx, cy, progress, isFinal) {
    let p = window.mandalaParams;
    if (!p) return;
    let layers = p.layers;
    let petals = p.petals;
    
    let currentLayers = isFinal ? layers : Math.max(0.1, progress * layers);
    
    ctx.save();
    ctx.translate(cx, cy);
    
    for(let l = 1; l <= Math.ceil(currentLayers); l++) {
        let layerRadius = (p.maxRadius / layers) * l;
        let layerProgress = isFinal ? 1.0 : Math.min(1.0, Math.max(0.0, (progress * layers) - (l - 1)));
        
        if (layerProgress > 0) {
            ctx.beginPath();
            for(let i = 0; i < petals; i++) {
                let angle = (i * Math.PI * 2) / petals;
                angle += (l * (Math.PI / petals)); 
                
                let tipX = Math.cos(angle) * layerRadius * layerProgress;
                let tipY = Math.sin(angle) * layerRadius * layerProgress;
                
                let ctrlAngle1 = angle - (Math.PI / (petals * 0.5));
                let ctrlAngle2 = angle + (Math.PI / (petals * 0.5));
                let ctrlR = layerRadius * 0.8 * layerProgress;
                
                let c1x = Math.cos(ctrlAngle1) * ctrlR;
                let c1y = Math.sin(ctrlAngle1) * ctrlR;
                
                let c2x = Math.cos(ctrlAngle2) * ctrlR;
                let c2y = Math.sin(ctrlAngle2) * ctrlR;
                
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(c1x, c1y, tipX, tipY);
                ctx.quadraticCurveTo(c2x, c2y, 0, 0);
            }
            ctx.fillStyle = selectedColorHex;
            ctx.globalAlpha = 0.25;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
    }
    ctx.restore();
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
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 20;
        
        if (!isTransition) {
            ctx.globalAlpha = Math.random() * 0.4 + 0.1;
            ctx.beginPath();
            ctx.arc(cx, cy, 100 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                n.x += n.vx;
                n.y += n.vy;
                
                if (n.x < 10) { n.x = 10; n.vx *= -1; }
                if (n.x > bgCanvas.width - 10) { n.x = bgCanvas.width - 10; n.vx *= -1; }
                if (n.y < 10) { n.y = 10; n.vy *= -1; }
                if (n.y > bgCanvas.height - 10) { n.y = bgCanvas.height - 10; n.vy *= -1; }
                
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
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
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 15;
        
        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                let pullX = (cx - n.x) * 0.1;
                let pullY = (cy - n.y) * 0.1;
                n.vx += pullX;
                n.vy += pullY;
                n.vx *= 0.85;
                n.vy *= 0.85;
                n.x += n.vx;
                n.y += n.vy;
            } else {
                n.x += n.vx;
                n.y += n.vy;
                
                if (n.x < 10) { n.x = 10; n.vx *= -1; }
                if (n.x > bgCanvas.width - 10) { n.x = bgCanvas.width - 10; n.vx *= -1; }
                if (n.y < 10) { n.y = 10; n.vy *= -1; }
                if (n.y > bgCanvas.height - 10) { n.y = bgCanvas.height - 10; n.vy *= -1; }
            }

            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
    } else if (lvl2Round === 3) {
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 10;

        for (let i = 0; i < bgNodes.length; i++) {
            let n = bgNodes[i];
            
            if (isTransition) {
                n.x += (cx - n.x) * (0.05 + transitionProgress * 0.15);
                n.y += (cy - n.y) * (0.05 + transitionProgress * 0.15);
                n.radius *= 0.9;
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
            ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!isTransition) {
            ctx.lineWidth = 2;
            for (let i = 0; i < bgNodes.length; i++) {
                for (let j = i + 1; j < Math.min(i + 8, bgNodes.length); j++) {
                    let dx = bgNodes[i].x - bgNodes[j].x;
                    let dy = bgNodes[i].y - bgNodes[j].y;
                    let distSq = dx*dx + dy*dy;
                    if (distSq < 3600) {
                        ctx.globalAlpha = 1.0 - (Math.sqrt(distSq) / 60);
                        ctx.beginPath();
                        ctx.moveTo(bgNodes[i].x, bgNodes[i].y);
                        ctx.lineTo(bgNodes[j].x, bgNodes[j].y);
                        ctx.stroke();
                    }
                }
            }
        } else {
            ctx.globalAlpha = transitionProgress;
            ctx.beginPath();
            ctx.arc(cx, cy, transitionProgress * 20, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

    } else if (lvl2Round === 4) {
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 15;
        
        let progress = elapsed / lvl2Duration;
        drawSolidMandala(ctx, cx, cy, progress, false);

        ctx.globalAlpha = 1.0;
        let numTracers = window.mandalaParams.petals;
        for(let i=0; i<numTracers; i++) {
            let angle = (i * Math.PI * 2) / numTracers;
            angle += elapsed; 
            let r = window.mandalaParams.maxRadius * Math.min(1.0, progress * 1.5);
            let pos = {
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            };
            
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = selectedColorHex;
            ctx.fill();
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
    playAudio('assets/Voltz.mp3');

    document.getElementById("introScreen").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("lvl2WarningScreen").style.display = "none";
    
    for (let key in keys) { keys[key] = false; }
    
    lvl2Round = 1;
    lvl2AccumulatedKinetic = 0;
    lvl2KineticTicks = 0;
    lvl2TotalFrames = 0; 
    
    const gc = document.getElementById("gameCanvas");
    if(gc) gc.style.opacity = "1";
    
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
    
    const gc = document.getElementById("gameCanvas");
    if(gc) gc.style.opacity = "1";
    
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
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    if (isPositive) {
        ctx.fillStyle = '#000000'; 
    } else {
        ctx.fillStyle = '#ffffff'; 
    }
    ctx.fill();
    
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
    
    for (let item of lvl2Items) {
        drawSynapse(lvl2Ctx, item.x, item.y, item.radius, item.type === 'spark');
    }
    
    for (let i = 0; i < lvl2Player.trail.length; i++) {
        let pos = lvl2Player.trail[i];
        let alpha = (i + 1) / lvl2Player.trail.length * 0.4; 
        lvl2Ctx.fillStyle = lvl2Player.color;
        lvl2Ctx.globalAlpha = alpha;
        lvl2Ctx.fillRect(pos.x - lvl2Player.width/2, pos.y - lvl2Player.height/2, lvl2Player.width, lvl2Player.height);
    }
    lvl2Ctx.globalAlpha = 1.0;

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
    
    const bgCanvas = document.getElementById("lvl2BgCanvas");
    if (bgCanvas) {
        const ctx = bgCanvas.getContext("2d");
        let cx = bgCanvas.width / 2;
        let cy = bgCanvas.height / 2;
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.strokeStyle = selectedColorHex;
        ctx.shadowColor = selectedColorHex;
        ctx.shadowBlur = 15;
        drawSolidMandala(ctx, cx, cy, 1.0, true);
        ctx.shadowBlur = 0;
    }

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

    playAudio('assets/Merciless Engines.mp3');

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
    lvl2GameActive = false;
    cancelAnimationFrame(lvl2AnimationFrameId);
    
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
<strong>RP Application Experience:</strong><br>
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

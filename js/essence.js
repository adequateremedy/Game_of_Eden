/* js/essence.js */
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
let playerRadius = 7;
let playerActive = false;
let keys = {};
let ringWidth = 0;
const ringsCount = 10;

// Game State & Mechanics Variables
let gameStarted = false;
let gameTimer = 300; // 5 minutes in seconds
let timerInterval = null;
let orbsCollectedCount = 0;
let glowTimeRemaining = 10; // Starts at 10 seconds
let activeOrbs = [];
let hasEnteredMaze = false;

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

            // Show second instruction box
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

        // Position player's colored circle right outside the entrance
        const playerCircle = document.getElementById('player-circle');
        playerCircle.style.backgroundColor = selectedColorHex;
        playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;
        playerCircle.style.left = `${playerX}px`;
        playerCircle.style.top = `${playerY}px`;
        playerCircle.style.opacity = '1';

        // Enable movement listeners for entry step
        playerActive = true;
    }, 1000);
}

// Keyboard input listeners
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

class Cell {
    constructor(ring, thetaIndex, totalThetas) {
        this.ring = ring; 
        this.thetaIndex = thetaIndex; 
        this.totalThetas = totalThetas;
        this.visited = false;
        this.walls = {
            inward: true,
            outward: true,
            cw: true,
            ccw: true
        };
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
        // Entrance is closed
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

// Trigger 4 Simultaneous Events upon entering the maze
function triggerMazeEntry() {
    hasEnteredMaze = true;
    
    // 1. Close entrance visually by redrawing maze
    drawPacManCircularMaze(true);

    // 2. Spawn first 5 tiny white orbs
    spawnInitialOrbs();

    // 3. Start 5 min countdown timer & show UI
    document.getElementById('maze-ui').style.display = 'block';
    startMainTimer();

    // 4. Start glow countdown timer (10 seconds)
    startGleamTimer();
}

// Main 5-minute timer
function startMainTimer() {
    timerInterval = setInterval(() => {
        gameTimer--;
        let mins = Math.floor(gameTimer / 60);
        let secs = gameTimer % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (gameTimer <= 0) {
            clearInterval(timerInterval);
            alert("Time has run out! Your Essence faded.");
            location.reload();
        }
    }, 1000);
}

// Glow countdown & fading mechanic
function startGleamTimer() {
    let glowInterval = setInterval(() => {
        if (!playerActive) return;
        
        glowTimeRemaining--;

        // Visual fade logic when glow drops to 5 seconds or below
        let playerCircle = document.getElementById('player-circle');
        if (glowTimeRemaining <= 5 && glowTimeRemaining > 0) {
            let opacityFactor = glowTimeRemaining / 5; // Scales from 1 down to 0.2
            playerCircle.style.boxShadow = `0 0 ${Math.floor(25 * opacityFactor)}px ${selectedColorHex}`;
            playerCircle.style.opacity = opacityFactor;
        } else if (glowTimeRemaining <= 0) {
            clearInterval(glowInterval);
            alert("Your glow has burned out! You must restart.");
            location.reload();
        }
    }, 1000);
}

// Orb Management & Spawning Logic
function spawnInitialOrbs() {
    for (let i = 0; i < 5; i++) {
        spawnSingleOrb();
    }
}

function getRandomCellCoordinates() {
    const canvas = document.getElementById('mazeCanvas');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Pick random ring (from 1 to 9) and random angle
    let r = Math.floor(Math.random() * (ringsCount - 1)) + 1;
    let ringCells = currentMazeGrid[r];
    let t = Math.floor(Math.random() * ringCells.length);
    let startAngle = (t / ringCells[0].totalThetas) * 2 * Math.PI;
    let endAngle = ((t + 1) / ringCells[0].totalThetas) * 2 * Math.PI;
    let midAngle = (startAngle + endAngle) / 2;
    let midRadius = (r + 0.5) * ringWidth;

    let ox = cx + midRadius * Math.cos(midAngle);
    let oy = cy + midRadius * Math.sin(midAngle);

    // Ensure it's not within 10px of player's initial position
    let dx = ox - playerX;
    let dy = oy - playerY;
    if (Math.sqrt(dx*dx + dy*dy) < 15) {
        return getRandomCellCoordinates(); // Retry if too close
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
            // Collected!
            orb.element.remove();
            activeOrbs.splice(i, 1);

            orbsCollectedCount++;
            document.getElementById('orb-counter').innerText = orbsCollectedCount;

            // Add 5 seconds of glow (max visual stack cap rules)
            glowTimeRemaining = Math.min(glowTimeRemaining + 5, 25);
            let playerCircle = document.getElementById('player-circle');
            playerCircle.style.opacity = '1';
            playerCircle.style.boxShadow = `0 0 25px ${selectedColorHex}`;

            // Spawn replacement orb
            spawnSingleOrb();
        }
    }
}

// Precise Wall Collision Detection for Circular Maze
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

    let cellMidAngle = (startAngle + endAngle) / 2;
    let angleDiff = Math.abs(angle - cellMidAngle);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    let arcLen = distFromCenter * angleDiff;
    if (arcLen < playerRadius + 2) {
        if (cell.walls.cw && angle > cellMidAngle) return true;
        if (cell.walls.ccw && angle < cellMidAngle) return true;
    }

    return false;
}

// Game Loop for Player Movement with Entry Trigger & Collision
function gameLoop() {
    if (playerActive) {
        let speed = 2;
        let dx = 0;
        let dy = 0;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= speed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += speed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= speed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += speed;

        if (dx !== 0 || dy !== 0) {
            let nextX = playerX + dx;
            let nextY = playerY + dy;

            // Check if stepping across the entrance threshold for the very first time
            if (!hasEnteredMaze) {
                const canvas = document.getElementById('mazeCanvas');
                let distToCenter = Math.sqrt((nextX - canvas.width/2)**2 + (nextY - canvas.height/2)**2);
                let maxRadius = ringsCount * ringWidth;
                
                // If moving inward past outer perimeter boundary line
                if (distToCenter < maxRadius - 2) {
                    playerX = nextX;
                    playerY = nextY;
                    triggerMazeEntry();
                } else {
                    // Normal entry slide constraint
                    if (!checkCollision(nextX, playerY)) playerX = nextX;
                    if (!checkCollision(playerX, nextY)) playerY = nextY;
                }
            } else {
                // Standard active gameplay collision sliding
                if (!checkCollision(nextX, playerY)) playerX = nextX;
                if (!checkCollision(playerX, nextY)) playerY = nextY;

                // Check orb collection
                checkOrbCollection();

                // Check center reach win condition
                const canvas = document.getElementById('mazeCanvas');
                let distToCenter = Math.sqrt((playerX - canvas.width/2)**2 + (playerY - canvas.height/2)**2);
                if (distToCenter < ringWidth) {
                    playerActive = false;
                    clearInterval(timerInterval);
                    alert(`Maze Stabilized! Orbs Collected: ${orbsCollectedCount}`);
                    location.reload();
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

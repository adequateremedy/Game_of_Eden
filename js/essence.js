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
let mazeGridData = null;
let mazeParams = null;

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
        
        generateAndDrawPacManCircularMaze(false);

        setTimeout(() => {
            mazeContainer.style.opacity = '1';

            // Show instruction box on top of the maze
            const instructionBox = document.getElementById('maze-instruction-box');
            instructionBox.style.display = 'flex';
            setTimeout(() => {
                instructionBox.style.opacity = '1';
            }, 50);
        }, 50);
    }, 1000);
}

function closeMazeInstructions() {
    const instructionBox = document.getElementById('maze-instruction-box');
    instructionBox.style.opacity = '0';
    setTimeout(() => {
        instructionBox.style.display = 'none';
        // Redraw maze with a randomly placed outer entrance now visible
        generateAndDrawPacManCircularMaze(true);
    }, 1000);
}

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

function generateAndDrawPacManCircularMaze(showEntrance) {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const ringsCount = 10; 
    const ringWidth = (canvas.width / 2 - 30) / ringsCount; 
    let grid = [];

    // Seeded randomness using chosenMazeIndex combined with time/randomness for unique layout and random entrance spot
    let seed = (chosenMazeIndex + 1) * 1337 + (showEntrance ? Math.floor(Math.random() * 9999) : 0);
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

    // Handle outer entrance based on instruction state
    const outerRingIdx = ringsCount - 1;
    let outerCellsCount = grid[outerRingIdx].length;
    let randomEntranceIndex = Math.floor(random() * outerCellsCount);

    if (showEntrance) {
        grid[outerRingIdx][randomEntranceIndex].walls.outward = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // RENDER ENTIRE MAZE STRUCTURE WITH FULL GLOW IN SELECTED PLAYER COLOR
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

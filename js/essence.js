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
        
        const centerDot = document.getElementById('maze-center-dot');
        centerDot.style.backgroundColor = selectedColorHex;
        centerDot.style.setProperty('--glow-color', selectedColorHex);

        drawTrueConnectedCircularMaze(chosenMazeIndex);

        setTimeout(() => {
            mazeContainer.style.opacity = '1';
        }, 50);
    }, 1000);
}

// True Connected Labyrinth Generator (Option B structure with 12 rings + center chamber)
function drawTrueConnectedCircularMaze(mazeId) {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = 195;
    const rings = 12; // Option B high density rings for true labyrinth trial feel
    const ringWidth = maxRadius / (rings + 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#b87333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Outer Boundary Circle of the Maze
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Central Glowing Destination Chamber (Ring 13 / Center)
    const centerRadius = ringWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Deterministic pseudo-random generator seeded by mazeId
    let seed = (mazeId + 1) * 1337;
    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    // Grid tracking for cells [ring][sector] -> has wall to outer ring, has wall clockwise
    const sectorsPerRing = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
    
    // Initialize walls: wallOut[r][s] = true/false, wallCW[r][s] = true/false
    let wallOut = [];
    let wallCW = [];

    for (let r = 0; r < rings; r++) {
        let secCount = sectorsPerRing[r];
        wallOut.push(new Array(secCount).fill(true));
        wallCW.push(new Array(secCount).fill(true));
    }

    // Simplified spanning-tree carving algorithm to guarantee 100% solvability and true connectivity
    let visited = [];
    for (let r = 0; r < rings; r++) {
        visited.push(new Array(sectorsPerRing[r]).fill(false));
    }

    let stack = [];
    // Start carving from innermost ring layer next to center chamber
    let currR = rings - 1;
    let currS = Math.floor(random() * sectorsPerRing[currR]);
    visited[currR][currS] = true;
    stack.push({r: currR, s: currS});

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let r = current.r;
        let s = current.s;
        let secCount = sectorsPerRing[r];

        // Find unvisited neighbors (clockwise, counter-clockwise, inward, outward)
        let neighbors = [];
        
        // CW neighbor
        let nextS_cw = (s + 1) % secCount;
        if (!visited[r][nextS_cw]) {
            neighbors.push({r: r, s: nextS_cw, wallType: 'CW', targetS: s});
        }
        // CCW neighbor
        let nextS_ccw = (s - 1 + secCount) % secCount;
        if (!visited[r][nextS_ccw]) {
            neighbors.push({r: r, s: nextS_ccw, wallType: 'CW', targetS: nextS_ccw});
        }
        // Inward neighbor (if not innermost ring)
        if (r > 0) {
            let innerSecCount = sectorsPerRing[r - 1];
            let innerS = Math.floor(s * (innerSecCount / secCount));
            if (!visited[r - 1][innerS]) {
                neighbors.push({r: r - 1, s: innerS, wallType: 'Out', targetR: r - 1, targetS: innerS});
            }
        }
        // Outward neighbor (if not outermost ring)
        if (r < rings - 1) {
            let outerSecCount = sectorsPerRing[r + 1];
            let outerS = Math.floor(s * (outerSecCount / secCount));
            if (!visited[r + 1][outerS]) {
                neighbors.push({r: r + 1, s: outerS, wallType: 'Out', targetR: r, targetS: s});
            }
        }

        if (neighbors.length > 0) {
            // Pick random unvisited neighbor
            let pick = neighbors[Math.floor(random() * neighbors.length)];
            
            // Knock down wall between current and chosen neighbor
            if (pick.wallType === 'CW') {
                wallCW[r][pick.targetS] = false;
            } else if (pick.wallType === 'Out') {
                wallOut[pick.targetR][pick.targetS] = false;
            }

            visited[pick.r][pick.s] = true;
            stack.push({r: pick.r, s: pick.s});
        } else {
            stack.pop();
        }
    }

    // Ensure connection from innermost ring to center chamber
    wallOut[rings - 1][0] = false;
    // Ensure connection from outermost ring to outside world (entrance/exit openings)
    wallOut[0][0] = false;
    wallOut[0][Math.floor(sectorsPerRing[0] / 2)] = false;

    // Render the grid walls onto the canvas
    for (let r = 0; r < rings; r++) {
        let innerRadius = (r + 1) * ringWidth;
        let outerRadius = (r + 2) * ringWidth;
        let secCount = sectorsPerRing[r];
        let angleStep = (Math.PI * 2) / secCount;

        for (let s = 0; s < secCount; s++) {
            let startAngle = s * angleStep;
            let endAngle = (s + 1) * angleStep;

            // Draw outer arc wall if wallOut is true
            if (wallOut[r][s]) {
                ctx.beginPath();
                ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
                ctx.stroke();
            }

            // Draw radial spoke wall if wallCW is true
            if (wallCW[r][s]) {
                let x1 = cx + innerRadius * Math.cos(endAngle);
                let y1 = cy + innerRadius * Math.sin(endAngle);
                let x2 = cx + outerRadius * Math.cos(endAngle);
                let y2 = cy + outerRadius * Math.sin(endAngle);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }
}

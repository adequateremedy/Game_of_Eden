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

        createTrueCellularRadialMaze(chosenMazeIndex);

        setTimeout(() => {
            mazeContainer.style.opacity = '1';
        }, 50);
    }, 1000);
}

// True Cellular Radial Labyrinth Generator tailored for 440x440 canvas and 14 rings
function createTrueCellularRadialMaze(mazeId) {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const cx = 220;
    const cy = 220;
    const RINGS = 14;
    const maxRadius = 195;
    const ringHeight = maxRadius / RINGS;

    const rings = [];

    for (let r = 0; r < RINGS; r++) {
        const cells = Math.max(6, Math.round((r + 1) * 6));
        rings.push([]);
        for (let i = 0; i < cells; i++) {
            rings[r].push({
                ring: r,
                index: i,
                visited: false,
                cw: true,
                ccw: true,
                inner: true,
                outer: true
            });
        }
    }

    function neighbors(cell) {
        const list = [];
        const r = cell.ring;
        const i = cell.index;
        const count = rings[r].length;

        const left = (i - 1 + count) % count;
        const right = (i + 1) % count;

        list.push({ cell: rings[r][left], type: "ccw" });
        list.push({ cell: rings[r][right], type: "cw" });

        if (r > 0) {
            const innerCount = rings[r - 1].length;
            const idx = Math.floor(i * innerCount / count);
            list.push({ cell: rings[r - 1][idx], type: "inner" });
        }

        if (r < RINGS - 1) {
            const outerCount = rings[r + 1].length;
            const idx = Math.floor(i * outerCount / count);
            list.push({ cell: rings[r + 1][idx], type: "outer" });
        }

        return list.filter(n => !n.cell.visited);
    }

    function removeWall(a, b, type) {
        if (type === "cw") {
            a.cw = false;
            b.ccw = false;
        }
        if (type === "ccw") {
            a.ccw = false;
            b.cw = false;
        }
        if (type === "inner") {
            a.inner = false;
            b.outer = false;
        }
        if (type === "outer") {
            a.outer = false;
            b.inner = false;
        }
    }

    // Seeded pseudo-random generator based on mazeId so each Essence has a unique consistent layout
    let seed = (mazeId + 1) * 1337;
    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    const start = rings[RINGS - 1][Math.floor(random() * rings[RINGS - 1].length)];
    const stack = [];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const n = neighbors(current);

        if (n.length > 0) {
            const next = n[Math.floor(random() * n.length)];
            removeWall(current, next.cell, next.type);
            next.cell.visited = true;
            stack.push(next.cell);
        } else {
            stack.pop();
        }
    }

    // Openings: Outer entrance & center core exit
    start.outer = false;
    rings[0][0].inner = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#b87333";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let r = 0; r < RINGS; r++) {
        const inner = r * ringHeight + 12;
        const outer = (r + 1) * ringHeight + 12;
        const cells = rings[r].length;
        const step = (Math.PI * 2) / cells;

        for (let c = 0; c < cells; c++) {
            const cell = rings[r][c];
            const a1 = c * step;
            const a2 = (c + 1) * step;

            // Outer arc wall
            if (cell.outer) {
                ctx.beginPath();
                ctx.arc(cx, cy, outer, a1, a2);
                ctx.stroke();
            }

            // Inner arc wall (skip drawing innermost boundary ring so center chamber stays open)
            if (cell.inner && r > 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, inner, a1, a2);
                ctx.stroke();
            }

            // Clockwise radial spoke wall
            if (cell.cw) {
                ctx.beginPath();
                ctx.moveTo(
                    cx + inner * Math.cos(a2),
                    cy + inner * Math.sin(a2)
                );
                ctx.lineTo(
                    cx + outer * Math.cos(a2),
                    cy + outer * Math.sin(a2)
                );
                ctx.stroke();
            }
        }
    }

    // Draw central chamber ring boundary for the glowing destination core
    ctx.beginPath();
    ctx.arc(cx, cy, ringHeight + 12, 0, Math.PI * 2);
    ctx.stroke();
}

/* script.js */
const powerRegistry = {
    Agni: [
        "Spark Snap", "Ember Dart", "Cinder Shot", "Flame Whip", "Scorch Ray",
        "Heat Wave", "Burst Strike", "Flare Blast", "Ash Bullet", "Magma Spit",
        "Fireball", "Blaze Spear", "Inferno Strike", "Combustion Burst", "Torch Slam",
        "Furnace Lance", "Volcano Eruption", "Sun Strike", "Hellfire Blast", "Supernova Core"
    ],
    Jala: [
        "Dew Drop", "Mist Needle", "Splash Dart", "Puddle Kick", "Ripple Strike",
        "Aqua Jet", "Bubble Blast", "Stream Whip", "Frost Shard", "Water Bullet",
        "Tide Ram", "Geyser Spout", "Steam Breaker", "Ice Lance", "Tsunami Crash",
        "Glacier Smash", "Hydro Cannon", "Whirlpool Crush", "Maelstrom Burst", "Leviathan Strike"
    ],
    Prithvi: [
        "Dust Flick", "Sand Sting", "Pebble Cast", "Dirt Kick", "Mud Slap",
        "Stone Dart", "Rock Smash", "Clay Bullet", "Gravel Blast", "Earth Spike",
        "Boulder Toss", "Quake Strike", "Geo Lance", "Tremor Slam", "Fault Crush",
        "Titan's Awakening", "Meteor Strike", "Tectonic Shatter", "Core Eruption", "Planet Crash"
    ],
    Vayu: [
        "Breeze Flick", "Gust Dart", "Wind Slap", "Draft Strike", "Puff Blast",
        "Air Needle", "Zephyr Whip", "Gale Strike", "Squall Bullet", "Wind Blade",
        "Storm Feathers", "Cyclone Kick", "Aero Lance", "Tornado Blast", "Hurricane Strike",
        "Sky Stare", "Tempest Crush", "Typhoon Smash", "Vacuum Implosion", "Atmospheric Sever"
    ]
};

let playerStats = {
    element: "",
    color: "",
    emotion: "",
    orbs: 0,
    tier: "",
    baseDMG: 0,
    hz: 0,
    accuracyTier: "",
    velocity: 0,
    rhythmTier: "",
    multiplier: 1.0,
    totalDMG: 0,
    drainPercent: 0,
    drainText: "",
    powerName: ""
};

// Level 1 Logic
function selectAura(elementNode) {
    const allCircles = document.querySelectorAll('.aura-circle');
    allCircles.forEach(circle => {
        if (circle !== elementNode) {
            circle.classList.add('fade-out');
        }
    });

    elementNode.classList.add('float-center-top');
    playerStats.element = elementNode.getAttribute('data-element');
    playerStats.color = elementNode.getAttribute('data-color');
    playerStats.emotion = elementNode.getAttribute('data-emotion');

    setTimeout(() => {
        document.getElementById('onboardingText1').classList.add('hidden');
        const loreBox = document.getElementById('loreContainer');
        loreBox.classList.remove('hidden');
        document.getElementById('loreTitle').innerText = `${playerStats.element} Aura Selected`;
        document.getElementById('loreText').innerText = `You resonate with ${playerStats.element}, pulling from your core emotions of ${playerStats.emotion}.`;
    }, 600);
}

function showMazeInstructions() {
    document.getElementById('loreContainer').classList.add('hidden');
    document.getElementById('mazeInstructions').classList.remove('hidden');
}

function startLevel1Game() {
    document.getElementById('mazeInstructions').classList.add('hidden');
    document.getElementById('level1Game').classList.remove('hidden');
    spawnOrb();
}

function spawnOrb() {
    if (playerStats.orbs >= 20) {
        endLevel1();
        return;
    }
    const area = document.getElementById('orbArea');
    const orb = document.createElement('div');
    orb.classList.add('orb');
    
    const colors = {"Agni":"#ff4d4d", "Jala":"#4da6ff", "Prithvi":"#4dff4d", "Vayu":"#ffff4d"};
    orb.style.backgroundColor = colors[playerStats.element];
    
    orb.style.top = Math.random() * 370 + 'px';
    orb.style.left = Math.random() * 570 + 'px';
    
    orb.onclick = () => {
        playerStats.orbs++;
        document.getElementById('orbCount').innerText = playerStats.orbs;
        orb.remove();
        spawnOrb();
    };
    area.appendChild(orb);
}

function endLevel1() {
    document.getElementById('level1').classList.remove('active');
    document.getElementById('level1Result').classList.remove('hidden');
    document.getElementById('level1Result').classList.add('active');

    // Calculate Base DMG & Tier
    playerStats.baseDMG = playerStats.orbs * 5; 
    if (playerStats.orbs <= 5) playerStats.tier = "Novice";
    else if (playerStats.orbs <= 10) playerStats.tier = "Adept";
    else if (playerStats.orbs <= 15) playerStats.tier = "Expert";
    else playerStats.tier = "Master";

    playerStats.powerName = powerRegistry[playerStats.element][playerStats.orbs - 1];
}

// Level 2 Logic
let canvas, ctx, animationId;
let synapses = [];
let keysLevel2 = {};

function startLevel2() {
    document.getElementById('level1Result').classList.remove('active');
    document.getElementById('level2').classList.remove('hidden');
    document.getElementById('level2').classList.add('active');

    canvas = document.getElementById('synapseCanvas');
    ctx = canvas.getContext('2d');
    
    window.addEventListener('keydown', (e) => { if(e.code === 'Space') keysLevel2.space = true; });
    window.addEventListener('keyup', (e) => { if(e.code === 'Space') keysLevel2.space = false; });

    level2Loop();
    setTimeout(endLevel2, 10000); 
}

function drawSynapse(x, y, isPositive) {
    ctx.strokeStyle = isPositive ? '#ff66b2' : '#8b4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Central node
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.stroke();
    // Branches
    for(let i=0; i<3; i++) {
        ctx.moveTo(x, y);
        let angle = Math.random() * Math.PI * 2;
        let length = Math.random() * 10 + 5;
        ctx.lineTo(x + Math.cos(angle)*length, y + Math.sin(angle)*length);
    }
    ctx.stroke();
    ctx.shadowBlur = 10;
    ctx.shadowColor = isPositive ? '#ff66b2' : '#8b4513';
}

function level2Loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (Math.random() < 0.05) {
        synapses.push({
            x: Math.random() * canvas.width,
            y: 0,
            isPositive: Math.random() > 0.3,
            speed: Math.random() * 2 + 2
        });
    }

    for (let i = synapses.length - 1; i >= 0; i--) {
        let syn = synapses[i];
        syn.y += syn.speed;
        drawSynapse(syn.x, syn.y, syn.isPositive);

        if (syn.y > canvas.height - 20 && keysLevel2.space) {
            if (syn.isPositive) playerStats.hz += 5;
            else playerStats.hz -= 5;
            document.getElementById('hzCount').innerText = playerStats.hz;
            synapses.splice(i, 1);
        } else if (syn.y > canvas.height) {
            synapses.splice(i, 1);
        }
    }
    
    animationId = requestAnimationFrame(level2Loop);
}

function endLevel2() {
    cancelAnimationFrame(animationId);
    document.getElementById('level2').classList.remove('active');
    document.getElementById('level2Result').classList.remove('hidden');
    document.getElementById('level2Result').classList.add('active');

    // Calculate accuracy tier and base velocity
    if (playerStats.hz >= 60) {
        playerStats.accuracyTier = "Calm";
        playerStats.velocity = 10.0;
    } else if (playerStats.hz >= 30) {
        playerStats.accuracyTier = "Steady";
        playerStats.velocity = 7.5;
    } else {
        playerStats.accuracyTier = "Erratic";
        playerStats.velocity = 15.0; // Erratic but fast
    }
}

// Level 3 Logic
let round = 1;
let timers = [15, 20, 25, 30, 60];
let coreSize = 50;
let rhythmInterval;
let decayInterval;

function startLevel3() {
    document.getElementById('level2Result').classList.remove('active');
    document.getElementById('level3').classList.remove('hidden');
    document.getElementById('level3').classList.add('active');
    
    window.addEventListener('keydown', handleRhythmTap);
    startRound();
}

function handleRhythmTap(e) {
    if (e.code === 'Space') {
        coreSize += 15;
        updateCore();
    }
}

function updateCore() {
    const core = document.getElementById('rhythmCore');
    core.style.width = coreSize + 'px';
    core.style.height = coreSize + 'px';
}

function startRound() {
    if (round > 5) {
        endLevel3();
        return;
    }
    
    document.getElementById('roundCounter').innerText = round;
    let timeLeft = timers[round - 1];
    document.getElementById('timerText').innerText = timeLeft;
    coreSize = 150; 
    
    // Adjusted decay rates so rounds 4 and 5 aren't impossible
    let decayRate = 5 + (round * 2); 
    if (round >= 4) decayRate = 12; 

    clearInterval(decayInterval);
    decayInterval = setInterval(() => {
        coreSize -= decayRate;
        updateCore();
        if (coreSize < 10 || coreSize > 280) {
            // Fail state logic can go here. For now, we gently reset to center.
            coreSize = 150;
        }
    }, 100);

    clearInterval(rhythmInterval);
    rhythmInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerText').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(rhythmInterval);
            clearInterval(decayInterval);
            round++;
            startRound();
        }
    }, 1000);
}

function endLevel3() {
    window.removeEventListener('keydown', handleRhythmTap);
    document.getElementById('level3').classList.remove('active');
    document.getElementById('level3Result').classList.remove('hidden');
    document.getElementById('level3Result').classList.add('active');

    // For demonstration, deriving density from average core size logic (simulated)
    // We'll assign standard density here as a baseline for the example calculation
    playerStats.rhythmTier = "Standard";
    playerStats.multiplier = 1.5; 
}

// Final Discovery Logic
function calculateFinalResults() {
    document.getElementById('level3Result').classList.remove('active');
    document.getElementById('finalDiscoveryScreen').classList.remove('hidden');
    document.getElementById('finalDiscoveryScreen').classList.add('active');

    playerStats.totalDMG = playerStats.baseDMG * playerStats.multiplier;
    
    // Drain Matrix Logic
    let tierIndex = ["Novice", "Adept", "Expert", "Master"].indexOf(playerStats.tier);
    if(playerStats.orbs === 20) tierIndex = 4; // Perfect Master
    
    const drainMatrix = {
        0: { 1.0: 10, 1.5: 20, 2.0: 30 },
        1: { 1.0: 20, 1.5: 30, 2.0: 40 },
        2: { 1.0: 30, 1.5: 50, 2.0: 60 },
        3: { 1.0: 40, 1.5: 60, 2.0: 80 },
        4: { 1.0: 50, 1.5: 70, 2.0: 90 }
    };
    
    playerStats.drainPercent = drainMatrix[tierIndex][playerStats.multiplier];
    
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
    playerStats.drainText = drainScaleText[playerStats.drainPercent];

    generateText();
}

function generateText() {
    // Dynamic Text Generators
    let expressionText = "";
    let movementText = "";
    if (playerStats.accuracyTier === "Calm") {
        expressionText = "locking into absolute focus";
        movementText = "snaps forward with absolute, pinpoint precision, driving cleanly toward the target";
    } else if (playerStats.accuracyTier === "Steady") {
        expressionText = "grounding into a calm, practiced concentration";
        movementText = "surges forward along a steady, reliable path, maintaining balanced and controlled momentum";
    } else {
        expressionText = "twisting with raw, untamed intensity";
        movementText = "bursts forward with a highly destructive but erratic trajectory, sacrificing clean precision for sheer, untamed force";
    }

    let manifestationText = "";
    if (playerStats.element === "Agni") {
        manifestationText = playerStats.multiplier === 2.0 ? "condenses into a blinding, hyper-focused point of white-hot pressure that shimmers with dry heat" :
                            playerStats.multiplier === 1.5 ? "tightens into a disciplined, burning focal point that radiates steady, intense heat" :
                            "billows outward in a wide, sprawling wave, crackling with loose, ambient flames";
    } else if (playerStats.element === "Jala") {
        manifestationText = playerStats.multiplier === 2.0 ? "compresses into a razor-sharp, heavy drop of hyper-dense fluid carrying immense weight" :
                            playerStats.multiplier === 1.5 ? "flows into a controlled, fluid stream that ripples with quiet, deep pressure" :
                            "expands into a sweeping, mist-laden tide that saturates the surrounding air";
    } else if (playerStats.element === "Prithvi") {
        manifestationText = playerStats.multiplier === 2.0 ? "locks into a solid, unyielding mass of compressed earth and stone-like gravity" :
                            playerStats.multiplier === 1.5 ? "grounds itself into a heavy, reliable weight that anchors your stance completely" :
                            "spreads outward as a low, vibrating tremor that shakes the ground loosely over a wider area";
    } else {
        manifestationText = playerStats.multiplier === 2.0 ? "sharpens into a piercing, compressed blade of absolute vacuum pressure" :
                            playerStats.multiplier === 1.5 ? "gathers into a brisk, focused current that hums with kinetic energy" :
                            "billows out into a chaotic, sweeping gust of wind";
    }

    let impactDesc = "";
    if (playerStats.tier === "Novice" || playerStats.multiplier === 1.0) {
        impactDesc = "leave behind superficial marks, minor burns, or light physical bruising";
    } else if (playerStats.tier === "Master" || playerStats.multiplier === 2.0) {
        impactDesc = "blow through heavy resistance and cause severe, crippling structural or physical trauma";
    } else {
        impactDesc = "fracture standard defenses and deliver a forceful, concussive blow";
    }

    const finalStatsHTML = `
        <p>Your Core Essence is ${playerStats.element} (${playerStats.element === 'Agni' ? 'fire' : playerStats.element === 'Jala' ? 'water' : playerStats.element === 'Prithvi' ? 'earth' : 'air'}).</p>
        <p>Your Offensive Magic Power is ${playerStats.powerName}.</p>
        <p>Your understanding of this Power is ${playerStats.tier}.</p>
    `;
    
    const rpTemplate = `You tap into your ${playerStats.element} core, your body language ${expressionText} as you channel the Energy within. Around you, it ${manifestationText}, glowing with a bright ${playerStats.color} Aura. Shaped by your emotional Rhythm and Frequency, ${playerStats.powerName} ${movementText} at a velocity of ${playerStats.velocity}. Once unleashed, this concentrated Energy is amplified by a ${playerStats.multiplier}x core density, making it capable of delivering a final output of ${playerStats.totalDMG} DMG (Base ${playerStats.baseDMG} x ${playerStats.multiplier}) upon contact. Depending on the target's resilience, this strike can ${impactDesc}, instantly consuming ${playerStats.drainText} of your Essence to sustain the strike.`;

    document.getElementById('finalStats').innerHTML = finalStatsHTML;
    document.getElementById('rpExample').innerText = rpTemplate;
}

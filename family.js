// 1. Të dhënat e familjes suaj
const familyMembers = [
    { name: "Vlora", icon: "👩‍🍳", color: "#FF6B6B", bday: "11-12" }, 
    { name: "Bekim", icon: "👨‍💼", color: "#4D96FF", bday: "03-31" },
    { name: "Esma", icon: "👩‍🎓", color: "#FFD93D", bday: "07-31" },
    { name: "Ensar", icon: "👨‍💻", color: "#6BCB77", bday: "02-09" },
    { name: "Enes", icon: "👦", color: "#92A9BD", bday: "12-01" },
    { name: "Enuara", icon: "👧", color: "#F47C7C", bday: "08-09" }
];

const dingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');

// --- FIREBASE LIVE SYNC ---

// 2. Shfaqja e profileve me sistemin e ri të Statuseve (LIVE)
function renderProfiles(savedStatuses = {}) {
    const profileContainer = document.getElementById('profile-container');
    if(!profileContainer) return;
    profileContainer.innerHTML = ''; 

    familyMembers.forEach(member => {
        const status = savedStatuses[member.name] || 'home';
        
        let statusClass = 'status-home';
        if(status === 'work') statusClass = 'status-work';
        if(status === 'out') statusClass = 'status-out';
        if(status === 'road') statusClass = 'status-road';

        profileContainer.innerHTML += `
            <div class="col-3 col-md-2 text-center profile-card mb-3" onclick="toggleStatus('${member.name}', '${status}')">
                <div class="avatar" style="border-color: ${member.color};">
                    ${member.icon}
                    <div class="status-dot ${statusClass}"></div>
                </div>
                <span class="badge-name">${member.name}</span>
            </div>
        `;
    });
}

function toggleStatus(name, currentStatus) {
    let nextStatus;
    if (currentStatus === 'home') nextStatus = 'work';
    else if (currentStatus === 'work') nextStatus = 'out';
    else if (currentStatus === 'out') nextStatus = 'road';
    else nextStatus = 'home';

    // Ruaj në Firebase
    db.ref('familyStatuses/' + name).set(nextStatus);
}

// Dëgjo Live për Statuse
db.ref('familyStatuses').on('value', (snapshot) => {
    renderProfiles(snapshot.val() || {});
});

// 3. LOGJIKA E RROTËS SË FATIT (Mbetet e njëjtë)
let startAngle = 0;
const arc = Math.PI / (familyMembers.length / 2);
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;

function drawRouletteWheel() {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const outsideRadius = 85;
    const textRadius = 60;
    const insideRadius = 15;

    ctx.clearRect(0,0,200,200);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    familyMembers.forEach((member, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = member.color;
        ctx.beginPath();
        ctx.arc(90, 90, outsideRadius, angle, angle + arc, false);
        ctx.arc(90, 90, insideRadius, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(90 + Math.cos(angle + arc / 2) * textRadius, 90 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.font = 'bold 9px Poppins';
        ctx.fillText(member.name, -ctx.measureText(member.name).width / 2, 0);
        ctx.restore();
    });
}

function spinWheel() {
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if(spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const winner = familyMembers[index].name;
    document.getElementById("winnerName").innerText = "Fituesi: " + winner + " ✨";
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

// 4. LISTA E PAZARIT (LIVE)
function addGrocery() {
    const input = document.getElementById("groceryInput");
    if (input.value.trim() === "") return;
    
    const groceryRef = db.ref('groceryList').push();
    groceryRef.set({ text: input.value, id: groceryRef.key });
    input.value = "";
}

db.ref('groceryList').on('value', (snapshot) => {
    const list = document.getElementById("groceryList");
    list.innerHTML = "";
    const items = snapshot.val();
    if (items) {
        Object.values(items).forEach(item => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between grocery-item border-0 shadow-sm mb-2 rounded";
            li.innerHTML = `<span>${item.text}</span> <button class="btn btn-sm text-danger" onclick="db.ref('groceryList/${item.id}').remove()">✖</button>`;
            list.appendChild(li);
        });
    }
});

// 5. KËNDI I MESAZHEVE (LIVE)
function addNote() {
    const noteInput = document.getElementById("noteInput");
    if (noteInput.value.trim() === "") return;

    const colors = ['note-blue', 'note-yellow', 'note-pink', 'note-green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const noteRef = db.ref('familyNotes').push();
    noteRef.set({
        text: noteInput.value,
        color: randomColor,
        id: noteRef.key
    });
    noteInput.value = "";
}

db.ref('familyNotes').on('value', (snapshot) => {
    const board = document.getElementById("notesBoard");
    if (!board) return;
    board.innerHTML = "";
    const notes = snapshot.val();
    if (notes) {
        Object.values(notes).forEach(note => {
            const div = document.createElement("div");
            div.className = "col";
            div.innerHTML = `
                <div class="sticky-note ${note.color} h-100">
                    <span class="delete-note" onclick="db.ref('familyNotes/${note.id}').remove()">×</span>
                    <p class="mb-0">${note.text}</p>
                </div>
            `;
            board.appendChild(div);
        });
    }
});

// 6. NUMËRUESI I DITËLINDJEVE
function updateBirthdayTimer() {
    const now = new Date();
    let upcoming = null;
    let minDays = 366;

    familyMembers.forEach(m => {
        const [month, day] = m.bday.split('-');
        let bdayDate = new Date(now.getFullYear(), month - 1, day);
        
        if (bdayDate < now && bdayDate.toDateString() !== now.toDateString()) {
            bdayDate.setFullYear(now.getFullYear() + 1);
        }

        const diffTime = bdayDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (bdayDate.toDateString() === now.toDateString()) {
            document.getElementById("birthdayText").innerText = `SOT: Gëzuar Ditëlindjen ${m.name}! 🎂🥳`;
            confetti({ particleCount: 2, spread: 60, origin: { y: 0.8 } }); 
            return;
        }

        if (diffDays < minDays) {
            minDays = diffDays;
            upcoming = { name: m.name, days: diffDays };
        }
    });

    if (upcoming && !document.getElementById("birthdayText").innerText.includes("SOT")) {
        document.getElementById("birthdayText").innerText = 
            `Ditëlindja e radhës: ${upcoming.name} (edhe ${upcoming.days} ditë) 🎈`;
    }
}

// 7. DETYRAT (TO-DO) LIVE
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const memberSelect = document.getElementById("memberSelect");
    if (taskInput.value.trim() === "") return;

    const taskRef = db.ref('familyTasks').push();
    taskRef.set({ 
        text: taskInput.value, 
        member: memberSelect.value, 
        completed: false, 
        id: taskRef.key 
    });
    taskInput.value = "";
}

db.ref('familyTasks').on('value', (snapshot) => {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    const tasks = snapshot.val();
    if (tasks) {
        Object.values(tasks).forEach(task => {
            const li = document.createElement("li");
            li.className = `list-group-item d-flex justify-content-between align-items-center task-item shadow-sm ${task.completed ? 'done' : ''}`;
            li.innerHTML = `
                <div class="text-truncate" style="max-width: 70%;">
                    <span class="assignee-tag me-2" style="background-color: ${getMemberColor(task.member)}">${task.member}</span>
                    <span>${task.text}</span>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-success border-0" onclick="toggleTask('${task.id}', ${task.completed})">✅</button>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="db.ref('familyTasks/${task.id}').remove()">🗑️</button>
                </div>`;
            taskList.appendChild(li);
        });
    }
});

function toggleTask(id, currentStatus) {
    if (!currentStatus) {
        dingSound.play().catch(e => console.log("Sound error"));
        confetti({ particleCount: 80, spread: 50, origin: { y: 0.7 } });
    }
    db.ref('familyTasks/' + id + '/completed').set(!currentStatus);
}

function getMemberColor(n) {
    const m = familyMembers.find(m => m.name === n);
    return m ? m.color : "#0d6efd";
}

// 8. DARK MODE, QUOTES & WEATHER
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    if(document.getElementById("darkModeSwitch")) document.getElementById("darkModeSwitch").checked = true;
}

const familyQuotes = [
    "Familja është vendi ku jeta fillon dhe dashuria nuk mbaron kurrë.",
    "Gjërat e vogla bëjnë ditën e madhe. Forca familje! 💪",
    "Shtëpia është aty ku janë njerëzit që duam. ❤️",
    "Bashkë mund të arrijmë çdo gjë! 🏆"
];

function displayRandomQuote() {
    const q = document.getElementById('quoteText');
    if (q) q.innerText = familyQuotes[Math.floor(Math.random() * familyQuotes.length)];
}

async function getSkenderajWeather() {
    try {
        const res = await fetch('https://wttr.in/Skenderaj?format=j1');
        const data = await res.json();
        const temp = data.current_condition[0].temp_C;
        document.getElementById('temp').innerText = temp + "°C";
    } catch (e) { document.getElementById('temp').innerText = "6°C"; }
}

// FILLIMI
document.addEventListener("DOMContentLoaded", () => {
    getSkenderajWeather();
    displayRandomQuote();
    drawRouletteWheel();
    updateBirthdayTimer();
    setInterval(updateBirthdayTimer, 60000);
});

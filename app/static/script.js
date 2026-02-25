// 1-1. UUID 생성 또는 가져오기
function getUserId() {
    let uuid = localStorage.getItem('dumpit_uuid');
    if (!uuid) {
        uuid = crypto.randomUUID(); // 최신 브라우저 지원 UUID 생성
        localStorage.setItem('dumpit_uuid', uuid);
    }
    return uuid;
}

const USER_ID = getUserId();

// 1-2. 페이지 접속 시 자동 포커스 및 엔터 키 이벤트 설정
window.onload = () => {
    const inputField = document.getElementById('worryInput');
    
    // 페이지 로드 시 커서 자동 위치
    inputField.focus();

    // 엔터 키 입력 시 전송 (Shift + Enter는 줄바꿈)
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 엔터 시 줄바꿈 방지
            dumpWorry();        // 전송 함수 호출
        }
    });

    loadMyWorries(); // 초기 목록 로드
};

// 2. 고민 버리기 (POST)
async function dumpWorry() {
    const inputField = document.getElementById('worryInput');
    const content = inputField.value.trim(); // 공백만 있는 경우 방지

    if (!content) return; // 내용 없으면 아무것도 안 함

    const response = await fetch('/worries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: content,
            user_id: USER_ID
        })
    });

    if (response.ok) {
        inputField.value = '';
        // 전송 완료 후 데이터를 다시 불러와서 캔버스를 갱신함
        await loadData();
    }
}

// 3. 내 고민 불러오기 (GET)
async function loadMyWorries() {
    const response = await fetch(`/worries/me/${USER_ID}`);
    const worries = await response.json();
    
    const listElement = document.getElementById('myWorries');
    listElement.innerHTML = worries.map(w => `
        <li>
            <div class="content">${w.content}</div>
            <div class="time">${new Date(w.created_at).toLocaleString()}</div>
        </li>
    `).join('');
}

// 초기 로드
loadMyWorries();

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let nodes = [];
let currentPage = 'all'; // 'all' 또는 'me'

// 1. 초기 설정
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.onresize();

// 2. 노드(단어) 클래스
class Node {
    constructor(text, count) {
        this.text = text;
        this.baseSize = 14 + (count * 8); // 중복 횟수에 따른 크기
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 400;
        this.y = canvas.height / 2 + (Math.random() - 0.5) * 400;
        this.vx = (Math.random() - 0.5) * 0.5; // 아주 느린 이동
        this.vy = (Math.random() - 0.5) * 0.5;
        this.opacity = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // 중앙 원 근처에서 맴돌게 하는 가벼운 인력 로직 (선택사항)
        const dist = Math.hypot(canvas.width/2 - this.x, canvas.height/2 - this.y);
        if (dist > 300) {
            this.vx -= (this.x - canvas.width/2) * 0.00001;
            this.vy -= (this.y - canvas.height/2) * 0.00001;
        }

        if (this.opacity < 1) this.opacity += 0.02;
    }

    draw() {
        ctx.fillStyle = `rgba(78, 204, 163, ${this.opacity})`;
        ctx.font = `${this.baseSize}px Pretendard`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
    }
}

// 3. 시냅스 선 그리기 및 애니메이션 루프
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 선 그리기 (랜덤하게 이어진 시냅스)
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < 150) { // 일정 거리 이내일 때만 선 연결
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    requestAnimationFrame(animate);
}

// 4. 데이터 로드 및 가공
async function loadData() {
    const url = currentPage === 'all' ? '/worries' : `/worries/me/${getUserId()}`;
    const response = await fetch(url);
    const data = await response.json();

    // 중복 집계
    const counts = {};
    data.forEach(w => counts[w.content] = (counts[w.content] || 0) + 1);

    nodes = Object.entries(counts).map(([text, count]) => new Node(text, count));
}

function switchPage(page) {
    currentPage = page;
    document.getElementById('page-title').innerText = page === 'all' ? "Everyone's" : "My Worries";
    loadData();
}

// 실행
animate();
loadData();
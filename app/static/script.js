// 1-1. UUID 생성 또는 가져오기
function getUserId() {
    let uuid = localStorage.getItem('dumpit_uuid');
    if (!uuid) {
        uuid = crypto.randomUUID(); // 최신 브라우저 지원 UUID 생성
        localStorage.setItem('dumpit_uuid', uuid);
    } else {
        // 하위 호환성을 위한 간단한 랜덤 ID 생성
        uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    localStorage.setItem('dumpit_uuid', uuid);
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
    
    // 파티클 생성 위치를 왼쪽 하단으로 설정
    const rect = inputField.getBoundingClientRect();
    // 한 점에서 나오는 게 아니라, 입력창 하단 가로 범위 내에서 랜덤하게 생성
    // rect.left(왼쪽 끝)부터 rect.width(너비)만큼의 범위
    for (let i = 0; i < 80; i++) { // 개수를 조금 늘리면 더 풍성
        const randomX = rect.left + (Math.random() * rect.width * 0.7) + rect.width * 0.05; // 입력창 가로 범위 내에서 랜덤 (중앙 70% 범위)
        const startY = rect.bottom;
        particles.push(new Particle(randomX, startY));
    }
    

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


/*
   캔버스 애니메이션 및 데이터 시각화
    - 고민 단어들을 노드로 표현
    - 노드 크기는 중복 횟수에 비례
    - 노드들은 중앙 원 주변에서 천천히 움직임
    - 노드 간에는 일정 거리 이내일 때만 선으로 연결
    - 페이지 전환 시 데이터 새로고침
*/
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
    
    // 파티클 업데이트 및 그리기
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
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
    const btnAll = document.getElementById('btn-all');
        const btnMe = document.getElementById('btn-me');

        // 활성화된 버튼 강조 효과 (옵션)
        if (page === 'all') {
            btnAll.style.background = 'rgba(100, 255, 218, 0.2)';
            btnMe.style.background = 'rgba(255, 255, 255, 0.1)';
        } else {
            btnMe.style.background = 'rgba(100, 255, 218, 0.2)';
            btnAll.style.background = 'rgba(255, 255, 255, 0.1)';
        }

        loadData();
}

// 5-1. 가루(파티클) 클래스 정의
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2; // 시작 각도만 생성
        this.oscillationSpeed = Math.random() * 0.05 + 0.02; // 흔들림 속도만 설정
        this.amplitude = Math.random() * 1.0 + 0.2; // 흔들림 범위 (1.0 ~ 1.2)
        this.size = Math.random() * 1.5 + 0.5;

        // 파티클 색상 팔레트 (민트, 화이트, 아쿠아, 연청)
        const colors = [
            '100, 255, 218', // 메인 민트
            '255, 255, 255', // 화이트 (반짝임)
            '128, 222, 234', // 연한 아쿠아
            '78, 204, 163'   // 조금 더 진한 초록빛 민트
        ];
        // 랜덤하게 하나 선택
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // 왼쪽 아래에서 오른쪽/아래 방향으로 살짝 퍼지게 설정
        this.vx = Math.random() * 1.5; // 오른쪽으로 살짝 퍼짐
        this.vy = Math.random() * 0.2;         // 아래로 떨어짐
        
        this.gravity = 0.001;                  // 중력 (아래로 당기는 힘)
        this.opacity = 1;
        this.fadeSpeed = 0.002;               // 천천히 사라짐
        this.friction = 0.98;                 // 공기 저항
    }

    update() {
        // [여기!] 매 프레임마다 각도를 더하고 x좌표에 반영해야 움직입니다.
        this.angle += this.oscillationSpeed; 
        this.x += Math.sin(this.angle) * 0.5; // 좌우 흔들림 부여

        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        
        this.opacity -= this.fadeSpeed;
    }

    draw() {
        // [수정] 미리 정해진 랜덤 색상에 현재 투명도만 적용
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        // 입자가 더 빛나 보이게 글로우 효과 살짝 추가
        ctx.shadowBlur = 3;
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // 다음을 위해 초기화
    }
}

let particles = []; // 파티클을 담을 배열

// 5-2. 가루 흩날리기 실행 함수
function createParticles() {
    const inputGroup = document.querySelector('.input-group');
    const rect = inputGroup.getBoundingClientRect();
    
    // 입력창 위치를 기준으로 가루 생성
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(centerX, centerY));
    }
}

// 실행
animate();
loadData();
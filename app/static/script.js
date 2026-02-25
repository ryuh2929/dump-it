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
        inputField.value = ''; // 입력창 비우기
        loadMyWorries();       // 목록 새로고침
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
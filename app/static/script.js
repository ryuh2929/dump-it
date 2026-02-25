// 1. UUID 생성 또는 가져오기
function getUserId() {
    let uuid = localStorage.getItem('dumpit_uuid');
    if (!uuid) {
        uuid = crypto.randomUUID(); // 최신 브라우저 지원 UUID 생성
        localStorage.setItem('dumpit_uuid', uuid);
    }
    return uuid;
}

const USER_ID = getUserId();

// 2. 고민 버리기 (POST)
async function dumpWorry() {
    const content = document.getElementById('worryInput').value;
    if (!content) return alert("내용을 입력해주세요!");

    const response = await fetch('/worries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: content,
            user_id: USER_ID
        })
    });

    if (response.ok) {
        document.getElementById('worryInput').value = '';
        loadMyWorries(); // 목록 새로고침
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
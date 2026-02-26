# 🌪️ Dump It! (고민 쓰레기통)

> **"마음속의 짐을 가루로 만들어 날려버리세요."** > 사용자의 고민을 입력받아 시각적인 파티클로 분해하고, 다른 사람들의 고민과 함께 밤하늘의 성단처럼 시각화해주는 힐링 웹 서비스입니다.

---

## 🚀 서비스 특징

* **시각적 카타르시스**: 고민을 입력하고 'Dump It!'을 누르면 텍스트가 가루가 되어 사라지는 애니메이션 구현.
* **익명 커뮤니티**: 모든 사용자의 고민이 노드(Node) 형태로 화면에 부유하며, 서로의 고민을 익명으로 공유.
* **개인화된 뷰**: '내 고민' 버튼을 통해 내가 작성한 기록만 필터링하여 확인 가능.
* **24시간 후에 사라지는 고민들**: 작성 후 24시간 뒤 자동으로 삭제.

---
## 서비스 페이지
* 메인 페이지
![2026-02-26-14-41-30메인-페이지](https://github.com/user-attachments/assets/afac29e9-9241-499c-be7b-ccdab7dd5df9)

* 텍스트 입력
![2026-02-26-14-38-33텍스트-입력](https://github.com/user-attachments/assets/1d750b16-b7d6-4aca-8855-645f540880de)

* 모두의 고민 /  내 고민
![2026-02-26-14-40-29모두의-고민_-내-고민](https://github.com/user-attachments/assets/114ae9a7-6dea-4d4b-8b31-8c41567ae531)


## 시연 영상
https://youtu.be/IArrVOU3vvg

## 🛠 Tech Stack
<img width="1071" height="510" alt="dumpit stack" src="https://github.com/user-attachments/assets/a36af852-2479-41d2-9c99-373ceadef200" />

### Frontend

* **HTML5 / CSS3**: 반응형 디자인 및 스타일링.
* **JavaScript**: 모든 동적 로직 및 API 통신.
* **Canvas API**: 고민 노드 시스템 및 파티클 애니메이션 엔진 구현.

### Backend

* **FastAPI (Python)**: 비동기 처리를 지원하는 고성능 API 서버.
* **Uvicorn**: ASGI 서버 엔진.
* **SQLAlchemy & aiosqlite**: 비동기 방식의 데이터베이스 ORM 및 SQLite 연동.

### Infrastructure & Deployment

* **AWS EC2 (Ubuntu 24.04 LTS)**: 클라우드 서버 호스팅.
* **AWS Application Load Balancer (ALB)**: 트래픽 분산 및 고정 세션(Sticky Session) 적용.
* **Local Storage**: 사용자 식별을 위한 고유 UUID 관리.

---

## 🏗 시스템 아키텍처

사용자가 접속하면 ALB를 통해 EC2 인스턴스의 8000번 포트(Uvicorn)로 연결됩니다. 데이터 일관성을 위해 로드밸런서에서 **Sticky Session**을 활성화하여 단일 SQLite DB 환경에서도 안정적인 사용자 경험을 제공합니다.

---

## 📦 설치 및 실행 방법 (Local)

1. **레포지토리 클론**
```bash
git clone https://github.com/ryuh2929/dump-it.git
cd dump-it

```


2. **가상환경 설정 및 패키지 설치**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

```


3. **서버 실행**

* **로컬에서 테스트 서버 실행**
```bash
uvicorn app.main:app --reload

```

* **aws 인스턴스에서 서버 실행**
```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

```

* **터미널 종료해도 서버 동작**
```bash
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

```

* **서버 종료**

프로세스 목록을 확인해서 `kill -9 [PID번호]` 하거나 아래 명령어로 모든 uvicorn 프로세스 종료
```bash
pkill -f uvicorn
```

4. **접속**
* **로컬 서버**

`http://localhost:8000`

* **aws 서버**
 
`http://dumpit-lb-1591477487.us-east-1.elb.amazonaws.com/`


---

## 📝 주요 구현 기록 (Troubleshooting)

* **보안 컨텍스트 이슈**: HTTP 환경에서 `crypto.randomUUID()`가 작동하지 않는 문제를 해결하기 위해 커스텀 UUID 생성 로직으로 하위 호환성 확보.
* **실행 순서(TDZ) 문제**: JavaScript의 클래스 및 변수 호이스팅 문제를 고려하여 선언부 최상단 배치로 초기화 에러 해결.
* **Sticky Session 적용**: 분산 서버 환경에서 파일 기반 DB(SQLite)의 데이터 파편화를 방지하기 위한 세션 고정 전략 수립.

---

## 👤 Author

* **ryuh2929** - *Initial Work*


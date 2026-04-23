# <img src="./app/static/favicons/android-icon-192x192.png" width="48" height="48" valign="middle"> Dump It! (고민 쓰레기통)

> **"마음속의 짐을 가루로 만들어 날려버리세요"**
> 사용자의 고민을 입력받아 시각적인 파티클로 분해하고, 다른 사람들의 고민과 함께 밤하늘의 성단처럼 시각화해주는 힐링 웹 서비스입니다.

---

## 🚀 서비스 특징

* **24시간 후에 사라지는 고민들**: 작성 후 24시간이 지나면 자동으로 삭제
* **시각적 카타르시스**: 고민을 입력하고 'Dump It!'을 누르면 텍스트가 가루가 되어 사라지는 애니메이션 구현
* **익명 커뮤니티**: 모든 사용자의 고민이 노드(Node) 형태로 화면에 부유하며, 서로의 고민을 익명으로 공유
* **개인화된 뷰**: '내 고민' 버튼을 통해 내가 작성한 기록만 필터링하여 확인 가능

---
## 🖥️ 서비스 페이지
### 메인 페이지
![2026-04-02-19-22-41메인-페이지](https://github.com/user-attachments/assets/3aa461b3-3636-4271-bdd3-f1687f59fa6c)

### 텍스트 입력
![2026-04-02-19-42-06텍스트-입력](https://github.com/user-attachments/assets/7cbb780a-95e1-4ca2-9823-755cd8bbc143)

### 모두의 고민 /  내 고민
![2026-04-02-19-24-46모두의-고민_-내-고민](https://github.com/user-attachments/assets/04bb5cc2-50e2-4dd9-8377-edac24891c54)

---

## 🎬 시연 영상
[https://youtu.be/IArrVOU3vvg](https://www.youtube.com/watch?v=7v3MoKfVr8w)

---

## 🛠 Tech Stack
<img width="1071" height="510" alt="dumpit stack" src="https://github.com/user-attachments/assets/a36af852-2479-41d2-9c99-373ceadef200" />

### Frontend

* **HTML5 / CSS3**: 반응형 디자인 및 스타일링
* **JavaScript**: 모든 동적 로직 및 API 통신
* **Canvas API**: 고민 노드 시스템 및 파티클 애니메이션 엔진 구현

### Backend

* **FastAPI (Python)**: 비동기 처리를 지원하는 고성능 API 서버
* **Uvicorn**: ASGI 서버 엔진
* **SQLAlchemy & aiosqlite**: 비동기 방식의 데이터베이스 ORM 및 SQLite 연동

### Infrastructure & Deployment

* **AWS EC2 (Ubuntu 24.04 LTS)**: 클라우드 서버 호스팅
* **AWS Application Load Balancer (ALB)**: 트래픽 분산 및 고정 세션(Sticky Session) 적용
* **Local Storage**: 사용자 식별을 위한 고유 UUID 관리

---

## 🏗 시스템 아키텍처

사용자가 접속하면 ALB를 통해 EC2 인스턴스의 8000번 포트(Uvicorn)로 연결됩니다. 

데이터 일관성을 위해 로드밸런서에서 **Sticky Session**을 활성화하여 단일 SQLite DB 환경에서도 안정적인 사용자 경험을 제공합니다.

---

## 📦 설치 및 실행 방법 (Local & AWS)

### Local
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

### AWS
* **aws 인스턴스에서 서버 실행**
```bash
cd dump-it/
source venv/bin/activate
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

* **데이터 삭제**
  
루트 디렉토리에서
```bash
python -m cleanup
```

---

## 🔗 **페이지 주소**
* **로컬 서버**

http://localhost:8000

* **aws 서버**
 
http://dumpit-lb-1591477487.us-east-1.elb.amazonaws.com/

---

## 📝 주요 구현 기록 (Troubleshooting)

* **24시간 자동 삭제 로직**: `APScheduler`의 `AsyncIOScheduler`를 도입하여 메인 API 성능에 영향을 주지 않고 10분 간격으로 백그라운드 청소 작업을 수행
* **보안 컨텍스트 이슈**: HTTP 환경에서 `crypto.randomUUID()`가 작동하지 않는 문제를 해결하기 위해 직접 UUID 생성 로직을 구현하여 하위 호환성 확보
* **실행 순서(TDZ) 문제**: JavaScript의 클래스 및 변수 호이스팅 문제를 고려하여 선언부 최상단 배치로 초기화 에러 해결
* **데이터 일관성 유지(Sticky Session)**: 분산 서버 환경에서 파일 기반 DB(SQLite)의 데이터 파편화를 방지하기 위한 세션 고정(Sticky Session) 전략 수립
* **CI/CD 자동화**: GitHub Actions와 AWS EC2를 연동하여 main 브랜치 업데이트 시 EC2에서 pull 하는 자동 배포 파이프라인 구축

---

## ✅ 향후 개선 계획 (Future Roadmap)

* [x] ~~**CI/CD 자동화**~~: 깃허브 Actions를 활용하여 main 브랜치에 merge시 자동 배포 기능 (구현 완료)
* [x] ~~**Favicon 추가**~~: 사이트에 어울리는 Favicon 제작 (구현 완료)
* [x] **~~"n명이 k개의 고민을 비워냈습니다" 문구 추가~~**: 메인 페이지에서 확인할 수 있는 간단한 글로벌 데이터 통계를 통해 심리적 동질감 유발 (구현 완료)
* [x] **~~DB 리셋 실행 파일 추가~~**: 문제가 생겼을 때 직접 DB에 접속하거나 관리 도구 없이 간단히 DB 전체를 삭제하는 코드 (구현 완료)
* [ ] **의미 기반 고민 데이터 통합**: 형태소 분석기(KoNLPy 등) 또는 경량화된 NLP 모델을 도입하여 유사 의미군을 하나로 통합. 데이터의 파편화를 막고 정확한 통계 추출 기반 마련
* [ ] **데이터 시각화 분석 대시보드**: 수집된 고민 데이터를 분석 및 가공하여 주간/월간 단위의 스트레스 트렌드 그래프 제공
* [ ] **서비스 안정성 및 도배 방지**: 동일한 UUID 또는 IP에서 단시간에 반복적으로 발생하는 데이터 입력을 차단하는 처리율 제한(Rate Limit) 로직 도입

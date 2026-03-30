from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from . import crud, models, schemas
from sqlalchemy.future import select
from .database import engine, Base, get_db, AsyncSessionLocal
from .scheduler import start_scheduler
from .models import Stats

from fastapi.staticfiles import StaticFiles

app = FastAPI(title="DumpIt API")

# 서버 시작 시 DB 테이블 생성 및 스케줄러 가동
@app.on_event("startup")
async def startup():
    # 1. 테이블 생성
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. 통계 테이블 초기값 설정
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # id가 1인 데이터가 있는지 확인
            result = await session.execute(select(Stats).where(Stats.id == 1))
            stats_entry = result.scalars().first()
            
            # 만약 데이터가 하나도 없다면 초기값(0, 0) 생성
            if not stats_entry:
                new_stats = Stats(id=1, total_users=0, total_worries=0)
                session.add(new_stats)
                await session.commit()
                print("📊 통계 테이블 초기값이 생성되었습니다.")

    # 3. 스케줄러 시작
    start_scheduler()

# 1. 고민 저장 API
@app.post("/worries", response_model=schemas.WorryRead)
async def create_worry(worry: schemas.WorryCreate, db: AsyncSession = Depends(get_db)):
    # 1. 고민 저장
    new_worry = await crud.create_worry(db=db, worry=worry)
    # 2. 통계 업데이트 (누적 고민 수 +1)
    await crud.update_worry_count(db=db)
    return new_worry
    # return await crud.create_worry(db=db, worry=worry)

# 통계 데이터 조회 API 추가
@app.get("/stats", response_model=schemas.StatsResponse)
async def read_stats(db: AsyncSession = Depends(get_db)):
    stats = await crud.get_stats(db)
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
    return stats

# 누적 사용자 수 조회 API
@app.post("/stats/visit")
async def record_visit(db: AsyncSession = Depends(get_db)):
    await crud.update_user_count(db)
    return {"status": "success"}

# 2. 모든 고민 조회 API
@app.get("/worries", response_model=List[schemas.WorryRead])
async def read_worries(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    worries = await crud.get_worries(db, skip=skip, limit=limit)
    return worries

# 3. 내 고민만 조회 API (UUID 기반 필터링은 나중에 CRUD에 추가 가능)
@app.get("/worries/me/{user_id}", response_model=List[schemas.WorryRead])
async def read_my_worries(user_id: str, db: AsyncSession = Depends(get_db)):
    # crud.py에 해당 함수가 없으므로 간단히 여기서 필터링 로직을 보여줍니다.
    # 나중에 crud.py로 옮기는 것이 깔끔합니다.
    from sqlalchemy.future import select
    result = await db.execute(
        select(models.Worry).where(models.Worry.user_id == user_id).order_by(models.Worry.created_at.desc())
    )
    return result.scalars().all()
    
# 4. 정적 파일 서빙 (HTML, CSS, JS 등)
# 정적 파일 경로 추가 (반드시 API 경로들보다 아래에 작성)
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
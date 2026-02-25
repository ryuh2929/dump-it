from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from . import crud, models, schemas
from .database import engine, Base, get_db
from .scheduler import start_scheduler

app = FastAPI(title="DumpIt API")

# 서버 시작 시 DB 테이블 생성 및 스케줄러 가동
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # 개발 초기에는 Base.metadata.create_all을 사용해 테이블을 자동 생성합니다.
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()

# 1. 고민 저장 API
@app.post("/worries", response_model=schemas.WorryRead)
async def create_worry(worry: schemas.WorryCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_worry(db=db, worry=worry)

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
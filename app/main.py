from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .database import engine, Base, get_db
from .scheduler import start_scheduler
import uvicorn

app = FastAPI()

# 앱 시작 시 DB 테이블 생성 및 스케줄러 가동
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()

@app.get("/")
def read_root():
    return {"message": "DumpIt Server is running!"}

# 여기에 고민 저장(POST), 조회(GET) API를 추가할 예정입니다.
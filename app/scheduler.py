from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete
from datetime import datetime, timedelta
from .database import engine
from .models import Worry

scheduler = AsyncIOScheduler()

async def delete_old_worries():
    # 현재 시간 기준 24시간 전 시간 계산
    threshold = datetime.utcnow() - timedelta(hours=24)
    
    async with engine.begin() as conn:
        # threshold보다 이전에 생성된 데이터 삭제
        await conn.execute(
            delete(Worry).where(Worry.created_at < threshold)
        )
    print(f"[{datetime.now()}] 24시간 지난 고민들을 청소했습니다.")

def start_scheduler():
    # 24시간마다 실행
    scheduler.add_job(delete_old_worries, 'interval', hours=24)
    scheduler.start()
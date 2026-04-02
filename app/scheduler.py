from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete
from datetime import datetime, timedelta, timezone
from .database import engine
from .models import Worry

scheduler = AsyncIOScheduler()
kst_now = datetime.now(timezone(timedelta(hours=9))).strftime('%Y-%m-%d %H:%M:%S')

async def delete_old_worries():
    # 현재 시간 기준 24시간 전 시간 계산
    threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    
    async with engine.begin() as conn:
        # threshold보다 이전에 생성된 데이터 삭제
        result = await conn.execute(
            delete(Worry).where(Worry.created_at < threshold)
        )
    print(f"[{kst_now}] 24시간 지난 고민들을 {result.rowcount}개 청소했습니다.")

def start_scheduler():
    # 1시간마다 실행
    scheduler.add_job(delete_old_worries, 'interval', hours=1)
    scheduler.start()
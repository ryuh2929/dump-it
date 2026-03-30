from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from . import models, schemas

# 고민 저장 로직
async def create_worry(db: AsyncSession, worry: schemas.WorryCreate):
    db_worry = models.Worry(
        content=worry.content,
        user_id=worry.user_id
    )
    db.add(db_worry)
    await db.commit()
    await db.refresh(db_worry)
    return db_worry

# 전체 고민 조회 로직 (최신순)
async def get_worries(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.Worry).order_by(models.Worry.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()

# 통계 가져오기
async def get_stats(db: AsyncSession):
    result = await db.execute(select(models.Stats).where(models.Stats.id == 1))
    return result.scalars().first()

# 누적 고민 수 업데이트
async def update_worry_count(db: AsyncSession):
    result = await db.execute(select(models.Stats).where(models.Stats.id == 1))
    stats = result.scalars().first()
    if stats:
        stats.total_worries += 1
        await db.commit()
        await db.refresh(stats)
    return stats

# 누적 사람 수 업데이트
async def update_user_count(db: AsyncSession):
    result = await db.execute(select(models.Stats).where(models.Stats.id == 1))
    stats = result.scalars().first()
    if stats:
        stats.total_users += 1
        await db.commit()
        await db.refresh(stats)
    return stats
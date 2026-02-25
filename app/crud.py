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
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from .database import Base

class Worry(Base):
    __tablename__ = "worries"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)  # 고민 내용
    user_id = Column(String)  # 브라우저 캐시용 UUID
    # lambda를 사용하여 호출 시점의 '시간대 정보가 포함된 UTC'를 저장
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Stats(Base):
    __tablename__ = "stats"

    id = Column(Integer, primary_key=True, index=True)
    total_users = Column(Integer, default=0)
    total_worries = Column(Integer, default=0)
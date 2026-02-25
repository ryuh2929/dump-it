from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class Worry(Base):
    __tablename__ = "worries"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)  # 고민 내용
    user_id = Column(String)  # 브라우저 캐시용 UUID
    created_at = Column(DateTime, default=datetime.utcnow) # 생성 시간 (UTC 기준)
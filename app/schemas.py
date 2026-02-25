from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. 사용자가 서버에 고민을 보낼 때 쓰는 모양
class WorryCreate(BaseModel):
    content: str    # 고민 내용은 반드시 문자열이어야 함
    user_id: str    # 식별값도 반드시 있어야 함

# 2. 서버가 사용자에게 고민을 보여줄 때 쓰는 모양
class WorryRead(BaseModel):
    id: int
    content: str
    user_id: str
    created_at: datetime # DB에 저장된 시간을 날짜 형식으로 변환해서 보냄

    class Config:
        from_attributes = True # SQLAlchemy 모델 데이터를 Pydantic으로 자동 변환 허용
import asyncio
from sqlalchemy import delete
from app.database import engine
from app.models import Worry

async def clear_all_worries():
    print("🚮 모든 고민 데이터를 삭제중 입니다... ")

    async with engine.begin() as conn:
        # 조건 없이 Worry 테이블의 모든 레코드 삭제
        result = await conn.execute(delete(Worry))
        deleted_count = result.rowcount

    print(f"✅ 완료: {deleted_count}개의 데이터가 영구 삭제되었습니다. 테이블이 깨끗해졌습니다! ✨")

if __name__ == "__main__":
    # 사용자 확인 절차 (실수 방지용)
    confirm = input("⚠️ [위험] 모든 고민 데이터를 삭제합니다. 정말 실행하시겠습니까? (y/n): ")
    if confirm.lower() == 'y':
        asyncio.run(clear_all_worries())
    else:
        print("취소되었습니다.")
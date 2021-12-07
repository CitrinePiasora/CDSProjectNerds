from pydantic import BaseModel

from typing import Optional


class Response(BaseModel):
    code: int
    message: str
    data: Optional[dict]
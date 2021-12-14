from typing import Optional, List, Union

from datetime import datetime
from pydantic import BaseModel


class Beatmap(BaseModel):
    id: int
    beatmap_id: int
    beatmapset_id: int
    artist: str
    title: str
    creator: str
    version: str

    alternate_p: float
    fingercontrol_p: float
    jump_p: float
    speed_p: float
    stamina_p: float
    stream_p: float
    tech_p: float

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class DefaultResponse(BaseModel):
    code: int
    message: str
    data: Optional[Union[dict[str, List[Beatmap]], dict[str, Beatmap], dict]]


class ExceptionResponse(BaseModel):
    code: int
    reason: str

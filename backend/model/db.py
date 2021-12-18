from typing import List

from sqlalchemy import (
    desc,
    select,
    update,
    Column,
    Integer,
    String,
    DateTime,
    Float,
)
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from config.db import Base


class Beatmap(Base):
    __tablename__ = "beatmaps"

    id = Column(Integer, primary_key=True)
    beatmap_id = Column(Integer, unique=True, nullable=False)
    beatmapset_id = Column(Integer, nullable=False)
    artist = Column(String, nullable=False)
    title = Column(String, nullable=False)
    creator = Column(String, nullable=False)
    version = Column(String, nullable=False)

    # Column for each predicted class
    alternate_p = Column(Float, nullable=False)
    fingercontrol_p = Column(Float, nullable=False)
    jump_p = Column(Float, nullable=False)
    speed_p = Column(Float, nullable=False)
    stamina_p = Column(Float, nullable=False)
    stream_p = Column(Float, nullable=False)
    tech_p = Column(Float, nullable=False)

    # Stats
    view_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


SIMPLE_COLUMNS = [
    Beatmap.beatmap_id,
    Beatmap.beatmapset_id,
    Beatmap.artist,
    Beatmap.title,
    Beatmap.creator,
    Beatmap.version,
    Beatmap.view_count,
    Beatmap.created_at,
    Beatmap.updated_at,
]


# Beatmap Data Access Layer
class BeatmapDAL:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    async def create_or_update_beatmap(
        self,
        beatmap_id: int,
        beatmapset_id: int,
        artist: str,
        title: str,
        creator: str,
        version: str,
        alternate: float,
        fingercontrol: float,
        jump: float,
        speed: float,
        stamina: float,
        stream: float,
        tech: float,
    ) -> None:
        """
        Create or update a beatmap
        :param beatmap_id: Beatmap ID
        :param beatmapset_id: BeatmapSet ID
        :param artist: Beatmap artist
        :param title: Beatmap title
        :param creator: Beatmap creator
        :param version: Beatmap version
        :param alternate: Alternate class probability
        :param fingercontrol: FingerControl class probability
        :param jump: Jump class probability
        :param speed: Speed class probability
        :param stamina: Stamina class probability
        :param stream: Stream class probability
        :param tech: Tech class probability
        """
        q = await self.db_session.execute(
            select(Beatmap).where(Beatmap.beatmap_id == beatmap_id)
        )
        if q.scalar() is None:
            new_beatmap = Beatmap(
                beatmap_id=beatmap_id,
                beatmapset_id=beatmapset_id,
                artist=artist,
                title=title,
                creator=creator,
                version=version,
                alternate_p=alternate,
                fingercontrol_p=fingercontrol,
                jump_p=jump,
                speed_p=speed,
                stamina_p=stamina,
                stream_p=stream,
                tech_p=tech,
                view_count=0,
            )
            self.db_session.add(new_beatmap)
            await self.db_session.commit()
        else:
            await self.db_session.execute(
                update(Beatmap)
                .where(Beatmap.beatmap_id == beatmap_id)
                .values(
                    alternate_p=alternate,
                    fingercontrol_p=fingercontrol,
                    jump_p=jump,
                    speed_p=speed,
                    stamina_p=stamina,
                    stream_p=stream,
                    tech_p=tech,
                )
            )

    async def get_beatmaps(self, limit, offset) -> List[Beatmap]:
        """
        Get beatmaps sorted by most recently updated
        :return: List of all beatmaps
        """
        q = await self.db_session.execute(
            select(*SIMPLE_COLUMNS)
            .order_by(desc(Beatmap.updated_at))
            .offset(offset)
            .limit(limit)
        )
        beatmaps = []
        for beatmap_id, beatmapset_id, artist, title, creator, version, *_ in q:
            beatmaps.append(
                {
                    "beatmap_id": beatmap_id,
                    "beatmapset_id": beatmapset_id,
                    "artist": artist,
                    "title": title,
                    "creator": creator,
                    "version": version,
                }
            )
        return beatmaps

    async def get_beatmaps_recent(self, limit, offset) -> List[Beatmap]:
        """
        Get beatmaps that are recently created
        :return: List of all beatmaps
        """
        q = await self.db_session.execute(
            select(*SIMPLE_COLUMNS)
            .order_by(desc(Beatmap.created_at))
            .offset(offset)
            .limit(limit)
        )
        beatmaps = []
        for beatmap_id, beatmapset_id, artist, title, creator, version, *_ in q:
            beatmaps.append(
                {
                    "beatmap_id": beatmap_id,
                    "beatmapset_id": beatmapset_id,
                    "artist": artist,
                    "title": title,
                    "creator": creator,
                    "version": version,
                }
            )
        return beatmaps

    async def get_beatmaps_popular(self, limit, offset) -> List[Beatmap]:
        """
        Get popular beatmaps
        :return: List of all beatmaps
        """
        q = await self.db_session.execute(
            select(*SIMPLE_COLUMNS)
            .order_by(desc(Beatmap.view_count))
            .offset(offset)
            .limit(limit)
        )
        beatmaps = []
        for beatmap_id, beatmapset_id, artist, title, creator, version, *_ in q:
            beatmaps.append(
                {
                    "beatmap_id": beatmap_id,
                    "beatmapset_id": beatmapset_id,
                    "artist": artist,
                    "title": title,
                    "creator": creator,
                    "version": version,
                }
            )
        return beatmaps

    async def get_beatmaps_preview(self) -> List[Beatmap]:
        """
        Get six beatmaps for each category (popular, recently uploaded, recently updated).
        :return: List of beatmaps
        """
        bPop = await self.get_beatmaps_popular(6, 0)
        bRUpl = await self.get_beatmaps_recent(6, 0)
        bRUpd = await self.get_beatmaps(6, 0)
        return {
            "bPop": bPop,
            "bRUpl": bRUpl,
            "bRUpd": bRUpd,
        }

    async def get_beatmap_by_set(self, beatmapset_id: int) -> List[Beatmap]:
        """
        Get a beatmap by ID
        :param beatmap_id: Beatmap ID
        :return: Beatmap
        """
        q = await self.db_session.execute(
            select(*SIMPLE_COLUMNS).where(Beatmap.beatmapset_id == beatmapset_id)
        )
        beatmaps = []
        for beatmap_id, beatmapset_id, artist, title, creator, version, *_ in q:
            beatmaps.append(
                {
                    "beatmap_id": beatmap_id,
                    "beatmapset_id": beatmapset_id,
                    "artist": artist,
                    "title": title,
                    "creator": creator,
                    "version": version,
                }
            )
        return beatmaps

    async def get_beatmap_by_set_and_id(
        self, beatmapset_id: int, beatmap_id: int
    ) -> Beatmap:
        """
        Get a beatmap by ID
        :param beatmap_id: Beatmap ID
        :return: Beatmap
        """
        q = await self.db_session.execute(
            select(Beatmap).where(
                Beatmap.beatmapset_id == beatmapset_id, Beatmap.beatmap_id == beatmap_id
            )
        )
        beatmap = q.scalar()
        await self.db_session.execute(
            update(Beatmap)
            .where(
                Beatmap.beatmapset_id == beatmapset_id, Beatmap.beatmap_id == beatmap_id
            )
            .values(view_count=beatmap.view_count + 1)
        )
        return beatmap

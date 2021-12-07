import enum
from types import coroutine
from typing import AsyncGenerator, Dict, List, TextIO, Tuple, Union
from aiofiles.threadpool.text import AsyncTextIOWrapper


_SECTION_TYPES = {
    "General": "a",
    "Editor": "a",
    "Metadata": "a",
    "Difficulty": "a",
    "Events": "b",
    "TimingPoints": "b",
    "Colours": "a",
    "HitObjects": "b",
}


def map_to_class(_cls, data):
    """
    Converts the data from a simple list to a class.
    Uses the items in the data list to set the attributes of the class.
    """
    for i in range(len(data)):
        data[i] = _cls(*data[i])
    return data


class HitObjects:
    """
    Stores data for each hit object.
    """
    class _Type(enum.Enum):
        """
        Enum for the different types of hit objects.
        """
        CIRCLE = 0
        SLIDER = 1
        SPINNER = 2
        UNUSED = 3

    class _SliderParams:
        """
        Stores the slider parameters.
        """
        class _Type(enum.Enum):
            """
            The type of slider.
            """
            LINEAR = 0
            BEZIER = 1
            CATMULL = 2
            PERFECT = 3
            UNUSED = 4

        def __init__(self, params: str, slides: int, length: float) -> None:
            params = params.split("|")
            self.type = self.getType(params[0])
            self.points = self.getPoints(params[1:])
            self.slides = slides
            self.length = length

        def getPoints(self, params: List[str]) -> List[Tuple[int, int]]:
            """
            Converts the points from a string to a list of tuples.
            """
            points = []
            for param in params:
                x, y = param.split(":")
                points.append((int(x), int(y)))
            return points

        def getType(self, _type) -> _Type:
            """
            Converts the slider type from a string to an enum.
            """
            if _type == "L":
                return self._Type.LINEAR
            elif _type == "B":
                return self._Type.BEZIER
            elif _type == "C":
                return self._Type.CATMULL
            elif _type == "P":
                return self._Type.PERFECT
            else:
                return self._Type.UNUSED

    class _SpinnerParams:
        """
        Stores the spinner parameters.
        """
        def __init__(self, time, params) -> None:
            self.t_length = params - time

    def __init__(self, x: int, y: int, time: int, _type: int, 
                 hitSound: int, objectParams: str="", *args) -> None:
        self.x = x
        self.y = y
        self.time = time
        self.new_combo = False       
        self.type = self.getType(_type)
        self.hitSound = hitSound
        self.object_params = None
        if self.type == self._Type.SLIDER:
            self.object_params = self._SliderParams(objectParams, args[0], args[1])
        elif self.type == self._Type.SPINNER:
            self.object_params = self._SpinnerParams(self.time, objectParams)

    def getType(self, _type: int) -> _Type:
        """
        Converts the hit object type from an int to an enum.
        """
        if _type & (1 << 2) != 0:
            self.new_combo = True
        
        if _type & (1 << 0) != 0:
            return self._Type.CIRCLE
        elif _type & (1 << 1) != 0:
            return self._Type.SLIDER
        elif _type & (1 << 3) != 0:
            return self._Type.SPINNER
        else:
            return self._Type.UNUSED


class Beatmap:
    """
    Beatmap Class holds the beatmap data.
    """

    # def __init__(self, file_object: TextIO) -> None:
    #     self.file_object = file_object
    #     self.sections = {}
    #     self.format_version = self.file_object.readline()
    #     self.parse_sections()
    #     map_to_class(HitObjects, self.sections["HitObjects"])

    @classmethod
    async def create(cls, file_object: AsyncTextIOWrapper):
        """
        Creates a new beatmap object.
        """
        self = Beatmap()
        self.file_object = file_object
        self.sections = {}
        self.format_version = await self.file_object.readline()
        await self.parse_sections()
        map_to_class(HitObjects, self.sections["HitObjects"])
        return self

    async def get_data(self) -> Tuple[List, List, List]:
        """
        Converts the beatmap to an array.
        structure:
        map_info = [
            hp, # HP Drain
            cs, # Circle Size
            od, # Overall Difficulty
            ar, # Approaching Circle
            sm, # Slider Multiplier
            str, # Slider Tickrate
            length, # Total length in ms
        ]
        hit_objects = [
            x, # Object position
            y, # Object position
            time, # Object time
            type, # Object type
            new_combo, # Is new combo
        ]
        slider_points = [
            x, # Object position
            y, # Object position
            type, # Slider Type
            slides, # Slider total back and forth
            length, # Slider length
        ]
        """
        map_info = [
            self.sections["Difficulty"]["HPDrainRate"],
            self.sections["Difficulty"]["CircleSize"],
            self.sections["Difficulty"]["OverallDifficulty"],
            self.sections["Difficulty"]["ApproachRate"],
            self.sections["Difficulty"]["SliderMultiplier"],
            self.sections["Difficulty"]["SliderTickRate"],
            self.sections["HitObjects"][-1].time
        ]
        hit_objects = []
        slider_points = []
        for hit_object in self.sections["HitObjects"]:
            data = [
                hit_object.x,
                hit_object.y,
                hit_object.time,
                hit_object.type.value,
                int(hit_object.new_combo)
            ]

            if hit_object.type == HitObjects._Type.SLIDER:
                for x, y in hit_object.object_params.points:
                    slider_points.append([x, y, hit_object.object_params.type.value, hit_object.object_params.slides, hit_object.object_params.length])
            else:
                slider_points.append([0, 0, 0, 0, 0])
            hit_objects.append(data)
        
        return map_info, hit_objects, slider_points

    async def parse_sections(self):
        """
        Parses the beatmap file and stores the sections in a dictionary.
        """
        async for section in self._parse_section_header():
            func = f"_read_type_{_SECTION_TYPES[section]}_section"
            self.sections[section] = await getattr(self, func)()
        

    async def _parse_section_header(self) -> AsyncGenerator[str, None]:
        """
        Parses the section header.
        """
        async for line in self.file_object:
            line = line.rstrip()
            if line.startswith("["):
                yield line[1:-1]

    def _parse_value(self, val: str) -> Union[int, str, float]:
        """
        Convert the value to either an int, float, or string.
        """
        if val.isdigit():
            return int(val)
        elif val.replace(".", "", 1).isdigit():
            return float(val)
        else:
            return val

    async def _read_type_a_section(self) -> Dict:
        """
        Read the A section, where each line is a key-value pair.
        """
        d = {}

        line = await self.file_object.readline()
        line = line.rstrip()
        while line != "":
            k, v = line.split(":", 1)
            d[k] = self._parse_value(v.strip())
            line = await self.file_object.readline()
            line = line.rstrip()
        
        return d

    async def _read_type_b_section(self) -> List:
        """
        Read the B section, where each line is a list of values.
        """
        l = []

        line = await self.file_object.readline()
        line = line.rstrip()
        while line != "":
            if not line.lstrip().startswith("//"):
                l.append(list(map(self._parse_value, line.split(","))))
            line = await self.file_object.readline()
            line = line.rstrip()

        return l
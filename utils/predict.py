import numpy as np

from typing import List, Tuple

from model.classifier import OsuClassifier
from utils import data
from utils.beatmap import Beatmap
from const import *


def predict_map_type(beatmap_path: str, model: OsuClassifier) -> List[Tuple[str, float]]:
    """
    Predict the map type of a beatmap.
    """
    with open(beatmap_path, 'r') as f:
        beatmap = Beatmap(f)
    map_info, hit_objects, slider_points = beatmap.get_data()
    assert len(hit_objects), "No hit objects found in beatmap"

    # Preprocess the data
    map_info = np.asarray([map_info], dtype=np.float32)
    hit_objects = data.convert_time_to_diff(np.asarray(hit_objects, dtype=np.float32))
    seq_ho = [hit_objects.shape[0]]
    slider_points = np.asarray(slider_points, dtype=np.float32)
    seq_sp = [slider_points.shape[0]]

    hit_objects = hit_objects.reshape(1, -1, HIT_OBJECTS_FEATURES)
    slider_points = slider_points.reshape(1, -1, SLIDER_POINTS_FEATURES)

    # Predict the map type
    map_type = model.predict(map_info, hit_objects, slider_points, seq_ho, seq_sp)
    map_type = map_type.detach().numpy()[0]

    # Return the map type
    return list(zip(LABELS, map_type))
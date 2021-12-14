from typing import List, Tuple

import torch
import numpy as np

from utils import data
from utils.beatmap import Beatmap
from model.classifier import OsuClassifier

from const import HIT_OBJECTS_FEATURES, SLIDER_POINTS_FEATURES, LABELS


async def predict_map_type(
    model: OsuClassifier, beatmap: Beatmap
) -> List[Tuple[str, float]]:
    """
    Predict the map type of a beatmap.
    """
    map_info, hit_objects, slider_points = await beatmap.get_data()
    assert len(hit_objects), "No hit objects found in beatmap"

    # Preprocess the data
    map_info = np.asarray([map_info], dtype=np.float32)
    hit_objects = data.add_diff_dim(np.asarray(hit_objects, dtype=np.float32))
    seq_ho = [hit_objects.shape[0]]
    slider_points = np.asarray(slider_points, dtype=np.float32)
    seq_sp = [slider_points.shape[0]]

    ## Standardize the data
    map_info, hit_objects, slider_points = data.standardize(
        map_info, hit_objects, slider_points
    )

    ## Reshape the data to (N, L, features), where N is the batch and L is sequence length
    hit_objects = hit_objects.reshape(1, -1, HIT_OBJECTS_FEATURES)
    slider_points = slider_points.reshape(1, -1, SLIDER_POINTS_FEATURES)

    # Convert to tensor
    map_info = torch.from_numpy(map_info).float()
    hit_objects = torch.from_numpy(hit_objects).float()
    slider_points = torch.from_numpy(slider_points).float()

    # Predict the map type
    map_type = model(map_info, hit_objects, slider_points, seq_ho, seq_sp)
    map_type = map_type.detach().numpy().tolist()[0]

    # Return the map type
    return {label: prob for label, prob in zip(LABELS, map_type)}

import torch
import numpy as np

from typing import Tuple
from numpy.typing import ArrayLike
from torch.types import _TensorOrTensors

from model.classifier import OsuClassifier
from const import *


def add_diff_dim(arr):
    """ Add a dimension to the array """
    # Duplicate the time column (index 2)
    new_arr = np.insert(arr, 3, arr[:, 2], axis=1)
    diff = (new_arr[1:, 3] - new_arr[:-1, 3])
    new_arr[1:, 3] = diff
    new_arr[0, 3] = 0
    return new_arr

def standardize(map_info: ArrayLike, hit_objects: ArrayLike, slider_points: ArrayLike) -> Tuple[ArrayLike, ArrayLike, ArrayLike]:
    """ Standardize the map info, hit objects and slider points """
    return (
        (map_info - MAP_INFO_MEAN) / MAP_INFO_STD,
        (hit_objects - HIT_OBJECTS_MEAN) / HIT_OBJECTS_STD,
        (slider_points - SLIDER_POINTS_MEAN) / SLIDER_POINTS_STD
    )
import torch

from typing import Tuple
from numpy.typing import ArrayLike
from torch.types import _TensorOrTensors

from model.classifier import OsuClassifier
from const import *


def convert_time_to_diff(arr: ArrayLike) -> ArrayLike:
    """
    Convert the time array to the difference between the time points.
    """
    # index 2 is the time
    diff = (arr[1:, 2] - arr[:-1, 2])
    arr[1:, 2] = diff
    arr[0, 2] = 0
    return arr

def standardize(map_info: ArrayLike, hit_objects: ArrayLike, slider_points: ArrayLike) -> Tuple[ArrayLike, ArrayLike, ArrayLike]:
    """
    Standardize the map info, hit objects and slider points.
    """
    return (
        (map_info - MAP_INFO_MEAN) / MAP_INFO_STD,
        (hit_objects - HIT_OBJECTS_MEAN) / HIT_OBJECTS_STD,
        (slider_points - SLIDER_POINTS_MEAN) / SLIDER_POINTS_STD
    )
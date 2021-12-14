# Dataset labels
LABELS = ["alternate", "fingercontrol", "jump", "speed", "stamina", "stream", "tech"]


# Dataset means and stds
MAP_INFO_MEAN = [
    5.086878776550293,
    3.9431185722351074,
    8.579185485839844,
    9.372329711914062,
    1.9036290645599365,
    1.0852551460266113,
    163900.6875,
]
MAP_INFO_STD = [
    1.3778526782989502,
    0.5091124773025513,
    1.165154218673706,
    0.9430193305015564,
    0.49491381645202637,
    0.46739593148231506,
    89435.6171875,
]

HIT_OBJECTS_MEAN = [
    254.6468048095703,
    193.0056915283203,
    114099.515625,
    189.37310791015625,
    0.31610336899757385,
    0.23395049571990967,
]
HIT_OBJECTS_STD = [
    128.61643981933594,
    100.21845245361328,
    84225.7109375,
    327.66436767578125,
    0.4691285789012909,
    0.42310771346092224,
]

SLIDER_POINTS_MEAN = [
    121.83447265625,
    90.19012451171875,
    54259.640625,
    0.779607355594635,
    0.5432359576225281,
    180.10670471191406,
]
SLIDER_POINTS_STD = [
    186.54356384277344,
    604.9847412109375,
    81493.1171875,
    1.17694890499115,
    0.8214328289031982,
    4800.84228515625,
]


# Classification model const
MAP_INFO_FEATURES = 7
HIT_OBJECTS_FEATURES = 6
SLIDER_POINTS_FEATURES = 6
NUM_CLASSES = len(LABELS)

HIDDEN_SIZE = 256
KEY_SIZE = 32
VALUE_SIZE = 32
N_LAYERS = 2
ATTN_N_LAYERS = 2
N_HEADS = 2
BIDIRECTIONAL = False
DROPOUT = 0.5


# API Status Code
class APIStatusCode:
    SUCCESS = 0
    INVALID_FILE = 1
    BEATMAP_TOO_LONG = 2
    BEATMAP_NOT_FOUND = 3
    BEATMAP_UNSUPPORTED = 4

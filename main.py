import torch
from aiofiles import tempfile
from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI, File, UploadFile

from const import *
from model.api import Response
from model.classifier import OsuClassifier
from utils.beatmap import Beatmap
from utils.predict import predict_map_type


description = "OsuClassy is a beatmap classifier that uses machine learning to classify beatmaps."
tags_metadata = [
    {
        "name": "predict",
        "description": "Predict beatmap type.",
    },
    {
        "name": "beatmaps",
        "description": "Beatmap information, such as beatmap ID, title, creator, etc. Also includes the predictions!",
    }
]
app = FastAPI(
    title="OsuClassy",
    description=description,
    version="0.0.1",
    terms_of_service="http://localhost.com/terms",
    contact={
        "name": "Fauzan Ardhana",
        "email": "fauzanardh@gmail.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url=None,
)
classification_model = OsuClassifier(
    MAP_INFO_FEATURES,
    HIT_OBJECTS_FEATURES,
    SLIDER_POINTS_FEATURES,
    NUM_CLASSES,
    hidden_size=HIDDEN_SIZE,
    num_layers=NUM_LAYERS,
    bidirectional=BIDIRECTIONAL,
    dropout=DROPOUT,
)
classification_model.eval()
classification_model.load_state_dict(torch.load("model/pretrained_weights/osuclasification_best.pt"))

@app.get("/", tags=["beatmaps"], response_model=Response)
async def root():
    return Response(
        code=SUCCESS,
        message="Welcome to OsuClassy API!",
    )

@app.post("/predict", tags=["predict"], response_model=Response)
async def predict_map(file: UploadFile=File(...)):
    """
    Predict beatmap class.

    - **file**: .osu file to predict.
    \f
    :param file: Uploaded file.
    """
    async with tempfile.TemporaryFile(mode="w+") as f:
        content = await file.read()
        # Decode and remove carriage return for beatmap saved on windows
        # Windows is annoying to handle :/
        content = content.decode("utf-8").replace("\r", "")
        await f.write(content)
        await f.seek(0)
        bm = await Beatmap.create(f)
        map_type = await predict_map_type(classification_model, bm)

    response = Response(
        code=SUCCESS,
        message="Success",
        data={
            "beatmap_id": bm.sections["Metadata"]["BeatmapID"],
            "beatmap_set_id": bm.sections["Metadata"]["BeatmapSetID"],
            "artist": bm.sections["Metadata"]["Artist"],
            "title": bm.sections["Metadata"]["Title"],
            "creator": bm.sections["Metadata"]["Creator"],
            "version": bm.sections["Metadata"]["Version"],
            "predicted_type": map_type,
        }
    )
    return response
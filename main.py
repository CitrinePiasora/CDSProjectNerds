import torch
from aiofiles import tempfile
from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI, File, UploadFile

from const import *
from model.api import Response
from model.classifier import OsuClassifier
from utils.beatmap import Beatmap
from utils.predict import predict_map_type


app = FastAPI()
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

@app.get("/", response_model=Response)
async def root():
    return Response(
        code=SUCCESS,
        message="Welcome to OsuClassy API!",
    )

@app.post("/predict", response_model=Response)
async def predict(file: UploadFile=File(...)):
    """
    Predict beatmap class.
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

def custom_openapi():
    """
    Custom OpenAPI function to add custom info to the OpenAPI document.
    """
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="OsuClassy API",
        version="0.0.1",
        description="Open source API for Osu beatmap classifier.",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://i.ppy.sh/84650abbb8bc7fcbfa58f6941ac6c2d00ef4a5bd/68747470733a2f2f6f73752e7070792e73682f77696b692f696d616765732f4272616e645f6964656e746974795f67756964656c696e65732f696d672f75736167652d73696e676c652d636f6c6f75722e706e67"
    }
    app.openapi_schema = openapi_schema
    return openapi_schema
app.openapi = custom_openapi
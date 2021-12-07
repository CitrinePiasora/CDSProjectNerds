from starlette.responses import JSONResponse
import torch
from pathlib import Path
from aiofiles import tempfile
from fastapi.encoders import jsonable_encoder
from fastapi import FastAPI, File, UploadFile, Request

from const import *
from model.api import Response
from model.exceptions import InvalidFileTypeException, InvalidFileException
from model.classifier import OsuClassifier
from utils.beatmap import Beatmap
from utils.predict import predict_map_type


# API init
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

# Classification Model
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

# Exceptions Handler
@app.exception_handler(InvalidFileTypeException)
async def invalid_file_handler(request: Request, exc: InvalidFileTypeException):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(Response(code=APIStatusCode.INVALID_FILE, message="Invalid file type. Only .osu files are allowed."))
    )
@app.exception_handler(InvalidFileException)
async def invalid_file_handler(request: Request, exc: InvalidFileException):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(Response(code=APIStatusCode.INVALID_FILE, message="Invalid file. File might be corrupted or not an osu beatmap file."))
    )

# Routes
@app.get("/", tags=["beatmaps"], response_model=Response)
async def root():
    return Response(
        code=APIStatusCode.SUCCESS,
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
    if Path(file.filename).suffix != ".osu":
        raise InvalidFileException()
    async with tempfile.TemporaryFile(mode="w+") as f:
        content = await file.read()
        # Decode and remove carriage return for beatmap saved on windows
        # Windows is annoying to handle :/
        try:
            content = content.decode("utf-8").replace("\r", "")
        except UnicodeDecodeError:
            raise InvalidFileException()
        # Write and move the cursor to the beginning of the file
        await f.write(content)
        await f.seek(0)
        # Parse and predict the beatmap
        bm = await Beatmap.create(f)
        map_type = await predict_map_type(classification_model, bm)

    return Response(
        code=APIStatusCode.SUCCESS,
        message="Successfully predicted beatmap type!",
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

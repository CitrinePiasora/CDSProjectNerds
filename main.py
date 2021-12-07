from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

import config


app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/predict")
async def predict():
    return {"message": "Hello World"}

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
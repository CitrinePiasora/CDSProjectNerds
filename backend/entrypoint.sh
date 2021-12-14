#!/bin/bash

echo "Starting uvicorn server..."
uvicorn main:app --host 0.0.0.0
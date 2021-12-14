# Pull alpine image with python installed
FROM python:3.9-bullseye

# Update os
RUN apt-get update 

# Move to /app directory
WORKDIR /app
ENV VIRTUAL_ENV=/app/venv

# Installing python dependencies
RUN pip install virtualenv
# Create virtual environment
RUN python -m virtualenv ${VIRTUAL_ENV}
# "Activate" virtual environment
ENV PATH=${VIRTUAL_ENV}/bin:${PATH}

# Upgrade pip
RUN python -m pip install --upgrade pip
# Copy requirements.txt to /app directory
# Copying only the requirements.txt so that
# the dependencies can be cached
ADD requirements.txt /app/requirements.txt
# Install python dependencies
RUN pip install -r requirements.txt
# Install PyTorch
RUN pip install torch==1.10.0+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Copy the source code to /app directory
ADD . /app

# Run the app
RUN chmod +x entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
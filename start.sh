#!/bin/bash

# Create a new namespace
kubectl create namespace osuclassy-dev

# Creating necessary stuff
kubectl apply -f k8s_configurations/secrets.yaml
kubectl apply -f k8s_configurations/pv.yaml
kubectl apply -f k8s_configurations/configmaps.yaml

echo "Deploying database..."
kubectl apply -f k8s_configurations/db-deployment.yaml

echo "Deploying the backend..."
kubectl apply -f k8s_configurations/backend-deployment.yaml

echo "Deploying the frontend..."
kubectl apply -f k8s_configurations/frontend-deployment.yaml

echo "Creating ingress..."
kubectl apply -f k8s_configurations/osuclassy-ingress.yaml

echo "Finished!"
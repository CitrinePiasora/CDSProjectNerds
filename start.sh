#!/bin/bash

# Database creation
echo "Deploying database..."
kubectl apply -f k8s_configurations/db-secret.yaml
kubectl apply -f k8s_configurations/db-pv.yaml
kubectl apply -f k8s_configurations/db-configmap.yaml
kubectl apply -f k8s_configurations/db-deployment.yaml

echo "Deploying the backend..."
kubectl apply -f k8s_configurations/backend-deployment.yaml

echo "Finished!"
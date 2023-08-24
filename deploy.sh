gcloud builds submit \
  --tag gcr.io/$GOOGLE_CLOUD_PROJECT/backend
gcloud run deploy backend \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/backend \
  --region asia-southeast2 \
  --allow-unauthenticated
gcloud run services update-traffic backend \
  --region asia-southeast2 \
  --to-latest
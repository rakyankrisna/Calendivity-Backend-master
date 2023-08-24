# Calendivity
Calendivity is an application that helps organize your daily priority schedule with recommendations for activities and challenges that will be given to make your day more productive.

# Technologies
* HapiJS
* Google OAuth
* Firestore Database

# Third Party API
* Google Calendar API
  - To listing the user calendar events
* Google Maps API
  - To listing the places based on the nearest point from latitude and longitude
* Cloud Translation API
  - To translate en to id from the response result of ML API

# How To Deploy On Cloud Run
Follow this instruction to deploy the API on Cloud Run
1. Create Google Cloud Platform project
2. Enable Google Calendar API and Cloud Translation API
3. Create API Key for Google Maps API
4. Enable OAuth conset screen
5. Create OAuth credential and save the credentials.json
6. Create Service Account for Firestore and save the keys.json
7. Clone this repository in Cloud Shell and open the cloned directory
9. Create new .env file from .env.example and fill the variable with appropriate value from step 3 and 5
10. Put the keys.json in the same directory as the project
11. **Important!:** edit the .gitignore file and remove the keys.json and .env line
12. Add permission to the deploy.sh file with `sudo chmod u+x deploy.sh`
13. Run the deploy.sh with `./deploy.sh`
14. Open the `[cloud-run-url]/docs` for the API documentation

# API Documentation
https://backend-6o3njyuh4q-et.a.run.app/docs

# Backend Team -Rakyan Krisna Dewangga-

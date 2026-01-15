# Setting up Firebase for the application

This application makes use of [Firebase Storage](https://firebase.google.com/docs/storage/) and [Firebase Data Connect](https://firebase.google.com/docs/data-connect) with PostgreSQL backend, which means that you will have to create a storage bucket and a data connect project.

## Migrating data

Application data used during the development process has been downloaded and contained within a zip file, which can be found [here](https://tallinn.sharepoint.com/:u:/r/sites/TLMdigiinkubatsioon/Shared%20Documents/Tallinna%20raha/UT%20CS%20ja%20TLM%20%E2%80%93%20Tallinna%20raha%20rakendus/firebase-data.zip?csf=1&web=1&e=mZfBUk). Download the zipfile and extract its contents to a known location.

### Firebase storage

For migrating coin image files to Firebase Storage, I advice using [Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk) for it. Once downloaded, authenticate and select the project using `gcloud init` command. After that has been completed you can copy files to Firebase Storage bucket using `gsutil` command:
```sh
$ gsutil -m cp -r images gs://<bucket-name>/images
```

### Database migration

It is advised to use Google Cloud's managed PostgreSQL instance for Data Connect backend. Schema migrations can be done by using Firebase CLI. In project's root directory run
```sh
$ firebase deploy --only dataconnect
```

This will then perform necessary schema migrations and setup queries to use with data connect. Once done, use the Google Cloud console to access PostgreSQL database and perform data migration. Data migration file can be found at zipfile's `sql/data.sql` file. This file contains `INSERT` statements for about 9000 rows.

## Setting up Firebase credentials in the application

Add a new web app in Firebase's project settings after which you should have valid credentials to use. Go to `src/config.ts` file in project's root directory and replace the credential values with new credentials.
The configuration structure looks something like this:
```typescript
const firebaseConfig: FirebaseOptions = {
    apiKey: "<api-key>",
    authDomain: "<auth-domain>",
    projectId: "<project-id>",
    storageBucket: "<storage-bucket>",
    messagingSenderId: "<messaging-sender-id>",
    appId: "<app-id>",
    measurementId: "<measurement-id>"
};
```
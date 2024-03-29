# nlmatics app

This repository contains nlmatics data extraction and search front end code. It also contains the code for ChattyPDF. The code has three different distinct themes: 1. nlmatics app 2. ChattyPDF 3. Edgar. 

## Available Scripts

In the project directory, you can run:

### `yarn install`

Installs all the dependencies specified in `package.json`. This is usually done only once when you checkout the code for the first time.

Note: Do not remove the yarn.lock files as the build may not work with other version combinations.

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

There are two ways in which local setup can be configured:

1. with BE services setup locally (default)

   For this to work nlmatics-services should be setup locally and available at http://localhost:5000/api

2. with BE services hosted at https://dev-portal.nlmatics.com/api

   To enable this you should create a new file `.env.development.local` at root directory and add `REACT_APP_BASE_SERVER_URL=https://dev-portal.nlmatics.com/api` to it.
   Note: This file should not be committed and hence is ignored in `.gitignore`.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `yarn prettier:fix`

Fixes all the prettier code style formatting errors.

### `yarn eslint:fix`

Fixes all eslint errors.

## Credits

This code was developed at Nlmatics Corp. from 2020-2023.

Wonjun Kang wrote the first version of nlm-app. Reshav Abraham contributed original code to the extraction grid component. The code was substantially extended and revamped by Ambika Sukla. Karen Reeves later contributed components and made improvements. Niranjan Borawake took over the code in early 2022 and completely revamped the code structure and design of the app, elevating the quality of the code, making it very performant and easier to follow.

The PDF Viewer is an extension of Mozilla https://mozilla.github.io/pdf.js/ to annotate search results. This extension was written by Ambika and later extended by Niranjan.
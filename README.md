# GoRestE2E

## Overview
GoRestE2E is an end-to-end testing framework designed for the GoRest API.
This project is built with Typescript and utilizes the Jest framework with Supertest library to create, manage, and run 
tests effectively.

## Prerequisites
* Node.js (v18.x or higher)
* npm (v9.x or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DoomAl/GoRestE2E.git
   cd GoRestE2E
    ```
2. Install the dependencies:
    ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
   
## Configuration
1. Create a .env file in the root directory and add the necessary environment variables:

    ```bash
    BASE_URL=https://gorest.co.in/public/v2
    ACCESS_TOKEN=your_access_token
    ```
    * BASE_URL: The base URL of the GoRest API.
    * ACCESS_TOKEN: The access token required to authenticate the requests.
      * Note: You can get the access token by signing up on the GoRest website and navigating to the API section.


2. Replace your_api_token_here with your actual API token from GoRest.

## Running the tests
To run the tests, execute the following command:
```bash
  npm test
```

* Notes: 
  * The tests will run in parallel by default. You can adjust the number of parallel test workers by 
    modifying the jest.config.js file.
  * The test results will be displayed in the console.
    * [IMPORTANT] No test reports file will be generated for this project. It can be done if needed.
  * Configuration check for env variable is done as a pretest step. If the env variable is not set, the tests will 
    not run. This is implemented in the jest.config.js file -> setupFiles.

## CD/CI
This project is configured to run on GitHub Actions. The workflow file is located in the .github/workflows directory.

* Blocking PR merge if the tests fail.
* env variables are stored as secrets in the GitHub repository.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
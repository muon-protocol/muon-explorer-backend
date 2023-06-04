
# Muon Explorer Backend

This repository hosts the backend implementation that is used by the [Muon Explorer](https://github.com/KMMRCap/Muon-Explorer/).

## Installation

Before proceeding with the installation of the Muon Explorer Backend, please ensure that you have the following prerequisites installed:
- Node.js
- npm
- pm2

You can install and use [nvm](https://github.com/nvm-sh/nvm) to install above prerequisites using the following commands:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install --lts
nvm use --lts
npm install npm@latest -g
npm  install pm2@latest -g
```

After having the prerequisites installed, the Muon Explorer Backend can be cloned and installed using the following commands:
```bash
git clone https://github.com/KMMRCap/Muon-Explorer-Backend.git
cd Muon-Explorer-Backend
npm i
```

After installation the the Muon Explorer Backend can be started using the following command:
```bash
pm2 start npm --name back_muon -- run start -- -p 8004
```
## Usage
To interact with the Muon Explorer Backend, you can make requests to the following endpoints:

#### 1. Get a Request by ID
- Endpoint: `/requests/<id>`  
- Description: Retrieve a specific request by its ID.  
- Method: `GET`  

#### 2. Get Requests with Pagination
- Endpoint: `/requests?page={page}&limit={limit}`  
- Description: Retrieve a list of requests with pagination support.  
- Method: `GET`  
- Parameters:  
  - `page` (optional): The page number of the results.  
  - `limit` (optional): The number of requests to retrieve per page.  

#### 3. Get Request History
- Endpoint: `/requests/history?range={days}&app={app}`
- Description: Retrieve number of requests within a specified time range for a specific application.
- Method: `GET`
- Parameters:
  - `range`: The number of days to include in the request history.
  - `app` (optional): The application name to filter the request history.

#### 4. Get Applications with Pagination
- Endpoint: `/applications?page={page}&limit={limit}`
- Description: Retrieve a list of applications with pagination support.
- Method: `GET`
- Parameters:
  - `page` (optional): The page number of the results.
  - `limit` (optional): The number of applications to retrieve per page.

#### 5. Get Application by Name
- Endpoint: `/applications/{app}`
- Description: Retrieve detailed information about a specific application.
- Method: `GET`
- Parameters:
  - `app`: The name of the application.

#### Notes
- A working instance of Muon Explorer Backend is available at `https://explorer.muon.net/api/v1` so you can query the list of recent requests using https://explorer.muon.net/api/v1/requests
- Explorer query nodes information from the monitor service and the API provided by this server only provides endpoint to query requests and applications.


## Application start introduction :

1. Prepare the environment :

First check if node js is installed :

```bash
node -v
```

if not, install it first.

<!-- ------------------ -->

Windows :

Download and install The LTS version of nodejs

<!-- ------------------ -->

Linux :

```bash
sudo apt install nodejs
sudo apt install npm
```

Check if it is installed correctly.

```bash
node -v
npm -v
```

Output :
e.g. V10.19.0

Rest of the work with node version manager (NVM) :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v18.16.0 # Check the LTS version of node js from nodejs.org
node -v
npm i -g npm@latest
npm -v
npm i -g pm2@latest
pm2 -v
```

<!-- ------------------ -->

2. Start the application :

First make sure apps folder is not empty and all of its content is present.
Then at the root directory of the app (where you can see the package.json file), run these commands :

```bash
npm i
pm2 start npm --name back_muon -- run start -- -p 8004
pm2 ls # check application status
```

<!-- ---------------------- -->

3. Nginx config :

location / {
    proxy_pass http://127.0.0.1:3004;
}
location /api/v1/applications {
    proxy_pass http://127.0.0.1:8004/applications;
}
location /api/v1/requests {
    proxy_pass http://127.0.0.1:8004/requests;
}
location /api/v1/nodes {
    proxy_pass http://103.75.196.96/nodes;
}
location /query/v1/ {
    proxy_pass http://127.0.0.1:8000/v1/;
}
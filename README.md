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
V10.19.0

Rest of the work with node version manager :
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v18.0.0 # Install LTS version
node -v
npm i -g npm@latest
npm -v
npm i -g pm2@latest
pm2 -v
```

<!-- ------------------ -->

2. Start the application :

Front End (Next js) :
At the root directory of the app (where you can see the package.json file), run these commands :

```bash
npm i
npm run build
pm2 start npm --name front_muon -- run start -- -p 3004
pm2 ls # check application status
```

Back End (Express js) :
At the root directory of the app (where you can see the package.json file), run these commands :

```bash
npm i
pm2 start npm --name front_muon -- run start -- -p 8004
pm2 ls # check application status
```

<!-- ---------------------- -->
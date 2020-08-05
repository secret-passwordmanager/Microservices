# Installation Instructions

## Prereqs
Make sure you have docker and docker-compose installed

### Getting Docker to run without root
1. sudo groupadd docker
2. sudo gpasswd -a $USER docker
3. Try to run docker without root. Run docker container ls. If it works, then we did it




## Step 1
### Create a .env file in the `microservices` directory
`cp .env-sample .env`
Enter a valid value for `docker_dir`. Try using the example directory of `/Docker/secret`

## Step 2
### Install Docker Containers
1. Navigate to the `microservices` folder
2. run `sudo docker-compose up -d`
3. run `docker logs secret_mssql`. Are there errors? Go to Step 3.


## Step 3
### Fix MSSQL's permissions.
1. Open terminal and `cd` to whatever directory you used for `docker_dir`
2. Now, type `sudo chmod 777`
3. Retry Step 2


# Microservices
Currently, there are 3 docker containers within the docker-compose file.
| Name | Port | Description |
|------|------|-------------|
|secret_mssql| 1433 | This is the database that the user_api uses |
|secret_user_api| 8000 | This is the user api |
|secret_mitm| 8001| This is the proxy that we use to replace credentials |


# Installation Instructions
## Prereqs
Make sure you have **docker** and **docker-compose** installed

### Getting Docker to run without root
1. sudo groupadd docker
2. sudo gpasswd -a $USER docker
3. Try to run docker without root. Run docker container ls. If it works, then we did it

## After Pulling From Master
To make sure that docker installs the newest versions of the containers, it is recommended to
run the following command any time you pull from master, especially when there are major changes
such as new columns in the database.
 `docker-compose build --no-cache`
This command will rebuild all of the containers from the dockerfiles, and not use any
cache that docker may have stored. Afterwards, proceed to Step 1

## Step 1
run `docker-compose up -d`

# Debugging Problems
If something is not working as expected, you can run `docker container ls` to see which containers
are currently running. If any of the 3 containers are not running you can run `docker logs {container_name}`
(remove the {}, and replace container_name)

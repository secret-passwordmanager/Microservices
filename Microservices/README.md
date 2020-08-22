# Important Notes
## After Pulling From Master
To make sure that docker installs the newest versions of the containers, it is recommended to
run the following command any time you pull from master, especially when there are major changes
such as new columns in the database:

 `docker-compose build --no-cache`

This command will rebuild all of the containers from the dockerfiles, and not use any
cache that docker may have stored. Afterwards, proceed to Step 1

## Restarting
If you need to restart a service, a good rule of thumb would be to restart them all. I 
would recommend just running:

`docker-compose restart`

The reason for the potential errors is because our authorization relies on a public key
that bouncer generates based off of random values that change every time you restart bouncer.
However, if another service, such as the user_api is not restarted, it is still using the
old key to verify, which wouldn't work

# Installation Instructions
## Prereqs
Make sure you have **docker** and **docker-compose** installed

## Getting Docker to run without root
You can follow these instructions so that you do not have to add `sudo` to every docker 
command. 
1. sudo groupadd docker
2. sudo gpasswd -a $USER docker
3. Reboot computer
4. Try to run docker without root. Run docker container ls. If it works, then we did it

## Starting Containers
If you have not pulled from master since the last time you ran the `docker-compose` command, you 
can simply run the following: 

`docker-compose up -d`

# Debugging Problems
If something is not working as expected, you can run `docker container ls` to see which containers
are currently running. If any of the 3 containers are not running you can run `docker logs {container_name}`
(remove the {}, and replace container_name). Then fix the problem or something idk

# Using the Secret API
[Here](https://documenter.getpostman.com/view/9830396/T1LV949V?version=latest#d4af5a9d-8704-48df-9053-ef13717cfc07) you can find the tests we run to validate that everything is working properly. You can use this
documentation to walk through certain scenarios that you may need to do. (Such as logging in, logging out,
creating a credential, updating it, etc).

# API Endpoints
We are using nginx as a reverse proxy to route all http requests to the proper microservice that will
handle them. If you are not familiar with a reverse proxy, it essentially looks at the url for the 
request you are making, and decides which microservice to forward the request. Currently, nginx is 
listening on port 8080, so any http request to be made to any of our microservices should be made on port
8080. Below is a table that goes into more detail for how nginx forwards its requests, as well as better 
(Change `ip` to be your computer's ip) 

| Url | Microservice | API Endpoint Documentation |
|-----|--------------| --------------|
| `ip`/user/* | secret_usman | [User API](https://docs.google.com/document/d/1CBh3EtYRP9pQcqUtRFken9FF3jxMfvshMlcplv2MuNk/edit#heading=h.ynqi8wk11m12)
| `ip`/credential/* | secret_usman|[Credential API](https://docs.google.com/document/d/1CBh3EtYRP9pQcqUtRFken9FF3jxMfvshMlcplv2MuNk/edit#heading=h.ynqi8wk11m12#heading=h.lsbr1b1y099)
| `ip`/swap/* | secret_user_api |[Swap API](https://docs.google.com/document/d/1CBh3EtYRP9pQcqUtRFken9FF3jxMfvshMlcplv2MuNk/edit#heading=h.ynqi8wk11m12#heading=h.v1uiww4v8q8o)
| `ip`/auth/* | secret_bouncer | [Bouncer API](https://github.com/secret-passwordmanager/Microservices/tree/Issue11-Bouncer/Microservices/bouncer#api-endpoints)


# Docker Containers
Currently, there are 5 docker containers within the docker-compose file.
| Name | Port | Description |
|------|------|-------------|
|secret_mssql| 1433 | This is the database that the user_api uses |
|secret_usman| 80 | This is the user api |
|secret_mitm| 8001| This is the proxy that we use to replace credentials |
|secret_bouncer| 80 | This is our auth api |
| secret_nginx | 8080 | This is our nginx reverse proxy that forwards all requests |



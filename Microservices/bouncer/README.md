# Issues/TODO
1. Other services aren't refreshing the JWK if it changes on bouncer

# About Bouncer
Bouncer is Secret's authentication microservice that is based on JWT Tokens.
[Here](https://youtu.be/SLc3cTlypwM) is a great talk that discusses exactly
how JWT can allow microservices to authenticate users, if you are not already
familiar with the topic. (Even watching the first 10-15 minutes can help a lot).
Here are some other excellent readings:
  - [JWT Intro](https://jwt.io/introduction/)
  - [JWT Playground](https://jwt.io/#debugger-io)
  - [How to Implement JWT in NodeJS](https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)
  - [How RSA Works](https://www.youtube.com/watch?v=4zahvcJ9glg)


# Authenticating on other microservices
## How to "login" in a nutshell
1. Make request to `/auth/login` to generate a `refreshToken`
2. Use that refreshToken to make a request to `/auth/refresh` to generate a `jwt`
3. On requests you wish to make on any of our microservice endpoints, add a header called 
`Authorization`, and its value should be "Bearer:+ " `jwt`


## Secret Authorization Roles
Currently, we are planning on having 2 seperate "roles" for each user. A user can be **untrusted**
or **trusted**. If you do not add the optional `masterCred` value when making a request to `/auth/login`,
a user will only be able to generate untrusted jwt's, and if you do add it, in the response for 
`/auth/refresh`, there will be both an unprivileged and trusted jwt. A trusted jwt has an
extra field that is a hashed version of their `masterCred`. Generally, you must use a trusted jwt 
any time the backend needs to decrypt any of your credentials, since the `masterCred` is required for
that. 

| Microservice Name | Require Trusted JWT  | No Authorization Required |
|-------------------|-------------------------|---------------------------|
| user_api   | `POST /swap/*`, `POST /credential/*`, `POST /user/` | `POST /user/new`|


# Bouncer API Endpoints
## `POST/auth/login`
Make a request to this url to log in a user. On success, it will return a 
`refreshToken` as well as a `userId` that can then be used to authenticate the user. 
If a request is made with the optional parameter `masterCred`, then the response's
`refreshToken` will be a **trusted** refresh token. (See `/auth/refresh` endpoint)
### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | String | Yes | The user's username |
| `password` | String | Yes | The user's password |
| `masterCred` | String | No | The user's master credential |
### Response (JSON)
| Status Code | Objects | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | {`userId`, `refreshToken`} | Returns  the user's Id as well as a refresh token which can be used to generate new `jwt` for up to 2 days |
| 401 | JSON | `errors` | Invalid password, username, or masterCred |
### Implementation
 - Make a request to user_api microservice to see if user exists
 - If user does not exist, return an `errorMessage` with status 404
 - If user does exist, generate a `refreshToken` and store it on database
    - `refreshToken` is simply a long random string
 - After 1 week, if user has not manually logged out, invalidate `refreshToken`
    - Just delete it from the database
   
## `POST/auth/logout`
Make a request to this url to log out the user with the user's `refreshToken`
in the request body
### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `userId` | String | Yes | The user's Id, which can be gotten from the `/auth/login` api endpoint |
| `refreshToken` | String | Yes | The user's refresh token |
| `global` | Bool | No | If set to true, will log user out from all devices|
### Response (JSON)
| Status Code | Objects | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `null` | Successfully logged the user out |
| 403 | JSON | `errors` | `refreshToken` is invalid, and not on server |
| 403 | JSON | `errors` | User is not currently logged in | 
### Implementation
  - Check if user is found on the server.
  - If he doesn't, respond with 403 error
  - Then check if user has any refresh tokens matching `refreshToken`
  - If it doesn't respond with 403 error
  - If it does, delete it from the user's tokens. 
  - If this was the user's only access token stored, or request had `global` set to true,
  remove user from the global map that contains the refresh tokens
  
## `POST/auth/refresh`
When provided with a `userId` and `refreshToken`, issue a new `jwt` that will
authorize the user on all other microservices for 5 minutes. After 5 minutes, a new 
request must be made, to get a new valid `jwt`. 
### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `refreshToken` | JSON | Yes | The user's refresh token |
### Response (JSON)
| Status Code | Objects | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `jwt` | Can use this token to authenticate on all other microservices |
| 403 | JSON | `errors` | `refreshToken` not found on server |
### Implementation
  - Generate a new JWT Token signed with the `JWK`
  - The token contains the user's Role, etc

## `GET/auth/jwk`
This endpoint allows the other microservices to get the `JWK` so that they can verify
that users trying to connect to them have successfully been authenticated.
### Request Body (None)
### Response (JSON)
| Status Code | Objects | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `{e,n,kty,kid,alg}` | This is a jwk that can be used to verify users are authenticated |

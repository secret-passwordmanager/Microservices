# Issues/TODO
1. ~~If a user logs out, the jwt is still valid until it expires
2. Other services aren't refreshing the JWK if it changes on bouncer
3. Only using the default dotnet JWT payload
   - Add authentication for priviledged access (i.e. If masterCred is specified)

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

# API Endpoints

## `POST/auth/login`
Make a request to this url to log in a user. On success, it will return a 
`refreshToken` that can then be used to authenticate the user. (See `/auth`)
endpoint

### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | String | Yes | The user's username |
| `password` | String | Yes | The user's password |
### Response (JSON)
| Status Code | Objects | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | {`userId`, `refreshToken`} | Returns  the user's Id as well as a refresh token which can be used to generate new `accessTokens` for up to 2 days |
| 404 | JSON | `errors` | User not found |

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
When provided with a `userId` and `refreshToken`, issue a new `accessToken` that will
authorize the user for all other microservices for 5 minutes. After 5 minutes, a new 
request must be made, but can reuse `refreshToken` if it is still valid. 

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

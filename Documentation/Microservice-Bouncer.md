# Bouncer
Bouncer is Secret's authentication microservice that is based on JWT Tokens.
[Here](https://youtu.be/SLc3cTlypwM) is a great talk that discusses exactly
how JWT can allow microservices to authenticate users, if you are not already
familiar with the topic. (Even watching the first 10-15 minutes can help a lot)

# API Endpoints

## `POST/login`
Make a request to this url to log in a user. On success, it will return a 
`refreshToken` that can then be used to authenticate the user. (See `/auth`)
endpoint

### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | String | Yes | The user's username |
| `password` | String | Yes | The user's password |

### Response
| Status Code | Body Type | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `refreshToken` | Returns a refresh token which can be used to generate new `accessTokens` for up to 2 days |
| 404 | JSON | `errorMessage` | User not found |

### Implementation
 - Make a request to user_api microservice to see if user exists
 - If user does not exist, return an `errorMessage` with status 404
 - If user does exist, generate a `refreshToken` and store it on database
    - `refreshToken` is simply a long random string
 - After 1 week, if user has not manually logged out, invalidate `refreshToken`
    - Just delete it from the database
    
## `POST/Logout`
Make a request to this url to log out the user with the user's `refreshToken`
in the request body

### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `refreshToken` | JSON | Yes | The user's refresh token |
### Response
| Status Code | Body Type | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `null` | Successfully logged the user out |
| 403 | JSON | `errorMessage` | `refreshToken` not found on server |

### Implementation
  - Check if `refreshToken` exists in the database.
  - If it doesn't respond with 403 error
  - If it does, delete it from the database
  - (Optionally) Create an end point for all other api's to make sure that the
  user's JWT's are invalidated

## `POST/auth`
When provided with a `refreshToken`, issue a new `accessToken` that is valid for 5 minutes.
After 5 minutes, you will have to make a new request to `/auth`

### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `refreshToken` | JSON | Yes | The user's refresh token |
### Response (JSON)
| Status Code | Body Type | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `accessToken` | Can use this token to authenticate on all other microservices |
| 403 | JSON | `eventMessage` | `refreshToken` not found on server |

### Implementation
  - Generate a new JWT Token signed with the `authPrivateKey`
  - The token contains the user's Role, etc
  
## `GET/publickey`
This endpoint allows the other microservices to get the `authPublicKey` so that they can verify
that users trying to connect to them have successfully been authenticated.
## Request Body (None)
## Response (JSON)
| Status Code | Body Type | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `authPublicKey` | Can use this key to verify users are authenticated |

# Bouncer
Bouncer is Secret's authentication microservice that is based on JWT Tokens.
[Here](https://youtu.be/SLc3cTlypwM) is a great talk that discusses exactly
how JWT can allow microservices to authenticate users, if you are not already
familiar with the topic. (Even watching the first 10-15 minutes can help a lot)

# API Endpoints

## `POST /login`
Make a request to this url to log in a user. On success, it will return a 
`refreshToken` that can then be used to authenticate the user with this 
[endpoint](#`/POST auth`)

### Request Body (JSON)
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | String | Yes | The user's username |
| `password` | String | Yes | The user's password |
### Response
| Status Code | Body Type | Body | Description |
|-------------|-----------|------|-------------|
| 200 | JSON | `refreshToken` | Returns a refresh token which can be used to generate new access tokens for up to 2 days |
| 404 | JSON | `errorMessage` | User not found |

## /Logout


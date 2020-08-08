# Postman Demo
This tutorial will help explain how Secret can allow users to securely enter credentials from any computer. 
By using Postman to manually make requests to our `user_api` microservice, you will hopefully get a better
understanding of how Secret works.

We will be trying to login to [ebay](ebay.com), so also have an account, and know your credentials

## Prerequisites
0. Make an ebay account
1. Install [Postman](https://www.postman.com/)
2. Follow [these]() instructions to install and run the Secret Docker Containers
3. Folow [these]() instructions to install the Secret Extension


## Registering a new Secret Account
Open Postman, and make a new POST request to `http://localhost/user/new`. In the body add the following:
```json
{
    "username":"myUsername",
    "password":"myPassword",
    "MasterCred": "myMasterCred",
    "firstName":"myFirstName",
    "lastName":"myLastName"
}
```
`MasterCred` is a password that we will indirectly use to encrypt all credentials that you add to Secret

## Authenticating 
Next, we need to log in to Secret. We can do this by making a POST request to `http://localhost/user/authenticate`. 
In the body, add the following: 
```json
{
    "username":"myUsername",
    "password":"myPassword",
}
```
In the response, you should see a JSON that looks like this:
```json
{
    "token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEiLCJyb2xlIjoiVXNlciIsIm5iZiI6MTU5NjkyMjA3MywiZXhwIjoxNTk3MDA4NDczLCJpYXQiOjE1OTY5MjIwNzN9.CrEKppBuka8JkEeP0BFpNSYufg2IsOxErymNYPNECfU"
}
```
Now, go to the Authorization tab in Postman, and select "Bearer Token" and copy the token into the field that appears

**For all subsequent requests, make sure that you add that token, otherwise you will receive a 401 unauthorized response**

## Adding a credential to Secret
Now, make a POST request to `http://localhost/credential/new` with the following in the body:
```json
{
    "Type": 2,
    "Domain": "",
    "Value": "myEbayUsername",
    "Hint": "ebay username",
    "MasterCred": "myMasterCred"
}
```
**Make sure that you use your ebay username for `Value`**

## Using Secret to replace Ebay Username
Now that you have a Secret account, 


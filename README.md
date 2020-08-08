# SECRET- Secure Credential Transportation

## Collaborators
Roy Dey, Patrick Liao, Martin Petrov, Marty Macalalad, Raza Ahmed

## Overall Goal
Our goal is to create a password manager that can keep a user's credentials untouchable by any malware that is on the computer the credentials are submitted from, as well as from man in the middle attacks on the local network. We feel that we can guarantee this by having the browser send randomly generated tokens in place of credentials, and then substituting the real credentials at the latest possible moment possible, via a proxy that would act as a man in the middle between the user and the router. 

## Getting Started
1. [Here](https://github.com/secret-passwordmanager/Legacy/tree/master/microservices) is the documentation for how to install the Secret Microservices onto your computer.
2. After you have installed the microservices, you can go to our firefox extension [repo](https://github.com/secret-passwordmanager/Extension) and follow the instruction on the README to install it.
3. Next, you can either install our mobile application that can be found [here](https://github.com/secret-passwordmanager/Picasso), or you can read [this](https://github.com/secret-passwordmanager/Legacy/tree/master/Documentation/Postman-Demo.md) documentation to simulate our phone app using **Postman**

## Repository Outline 
All of our code can be found within our `Microservices` folder. Currently we are using **Docker** to contain our microservices. Each subfolder contains the code for a single microservice, and also includes the dockerfile. 
Within each subfolder there should be a README that contains information about the relevant parts of the code, though our core logic is mostly contained in our [API](https://github.com/ECS153/final-project-group-0-/blob/master/microservices/dotnetapi/README.md)

### Folder Structure
  - Microservices: Folder containing all of our microservices.
  - Documentation: Markdown files describe how Secret works
  - ReadMe.md: You're reading it

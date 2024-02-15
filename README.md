# Laijoig

Laijoig (來揪一個) is a scheduling app that people can leave messages on others' events. Works on both **iOS** and **Android** devices.

It was built using [React Native](https://reactnative.dev/) as frontend and [AWS](https://aws.amazon.com/tw/) as the cloud provider.

## App architecture

### User Login
I built a simple user login system:
1. A user have to input their ID
2. If the user exists, it will go to the **Welcome back** page and ask for password
3. If you're a new user, you'll have to sign up

### Home page
The home page contains a calendar, and a list of events below it.
- **Add an activity** - There's a big button for people to add events
- **Leave a comment** - What my friends loved the most is that **you can have conversations on people's activities**

### Notifications page
At first, there was no **push notification** on this app, this page is to follow the most recent messages or activities

### Profile page
To view other's profile and their upcoming activities.

## The technology behind the screen

### React Native 
I could see both **iOS** and **Andriod** devices among my friends. And to **build an app for both platform at the same time**, I chose React Native as the tool to start it.

### DynamoDB
I chose AWS DynamoDB as the database to store **user data**, **activities** and **messages**.

### S3
AWS S3 is a cheap solution I found for storing large data like **users' pictures**.

### Other AWS Services

To communicate between the frontend and the cloud, I used services provided by AWS: 
- **API Gateway (REST API)** - Create custom API url for custom functions
- **Lambda** - Create custom functions to access the database and the S3 bucket

### Hash algorithm
A user's information is visible to the app owner, including the password.

Therefore, in one of the lambda function, I **hashed the password** before storing into the database to make sure even the data manager (me) couldn't see the passwords. 
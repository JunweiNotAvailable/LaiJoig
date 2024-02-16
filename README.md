# Laijoig

Laijoig (來揪一個) is a scheduling app that people can leave messages on others' events. Works on both **iOS** and **Android** devices.

It was built using [React Native](https://reactnative.dev/) as frontend and [AWS](https://aws.amazon.com/tw/) as the cloud provider.

## App architecture

### 1. User Login
I built a simple user login system:
1. A user have to input their ID
2. If the user exists, it will go to the **Welcome back** page and ask for password
3. If you're a new user, you'll have to sign up

<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/60e49a9c-99eb-4aef-a953-a1bdcf52b0dd" alt="" width="180" >
<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/a241c25f-7521-4a5e-9379-eca7a3f97cf3" alt="" width="180" >
<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/ecc1de38-271e-4ee0-b017-367b84251dfb" alt="" width="180" >

### 2. Home page
The home page contains a calendar, and a list of events below it.
- **Add an activity** - There's a big button for people to add events
- **Leave a comment** - What my friends loved the most is that **you can have conversations on people's activities**

<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/3c9777af-c511-43ac-840c-0cbf772a0d0c" alt="" width="180" >
<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/16361840-d563-4d53-99ed-179fe23ba95c" alt="" width="180" >
<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/cac90a3a-3a83-4ebe-afcb-db5b0ac9bd5b" alt="" width="180" >

### 3. Notifications page
At first, there was no **push notification** on this app, this page was to let people follow the most recent messages or activities

<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/309c2ba1-1f0d-468e-98cb-494808f2d05c" alt="" width="180" >

### 4. Profile page
To view other's profile and their upcoming activities.

## The technology behind the screen

### 1. React Native 
I could see both **iOS** and **Andriod** devices among my friends. And to **build an app for both platform at the same time**, I chose React Native as the tool to start it.

### 2. DynamoDB
I chose [AWS DynamoDB](https://aws.amazon.com/tw/pm/dynamodb/), a NoSQL database, as the database to store **user data**, **activities** and **messages**.

### 3. S3
AWS S3 is a cheap solution I found for storing large data like **users' pictures**.

### 4. Other AWS Services

To communicate between the frontend and the cloud, I used services provided by AWS: 
- **API Gateway (REST API)** - Create custom API url for custom functions
- **Lambda** - Create custom functions to access the database and the S3 bucket

### 5. Expo Notification
It took me a long time to add the **push notification** feature. I eventually implemented it with [Expo Notification](https://docs.expo.dev/versions/latest/sdk/notifications/) provided by [Expo](https://expo.dev)

<img src="https://github.com/JunweiNotAvailable/LaiJoig/assets/89463326/ad28eabe-5ae4-4056-874c-7da6f45e070e" alt="" width="180" >

### 6. Hash algorithm
A user's information is visible to the app owner, including the password.

Therefore, in one of the lambda function, I **hashed the password** before storing into the database to make sure even the data manager (me) couldn't see the passwords.
```javascript
const { action, password } = event.queryStringParameters;

if (action === 'generate') { // generate a hash before storing into database
  return await bcrypt.hash(password, 10);
} else if (action === 'compare') { // compare user's input to real password
  return await bcrypt.compare(password, hash);
}
```

## Why I built it

To know my motivation behind it, go to my personal website: https://junweinotavailable.netlify.app/laijoig

# Firebase-QuantumBotCore

## Overview

This project aims to create a seamless and efficient serverless system using Firebase, incorporating essential npm dependencies for streamlined development. The purpose is to address the critical need for communication through messages by leveraging the power of Firebase, ensuring scalability and reliability. Key features include a user-friendly interface, seamless functionality, and robust security measures.

## Technologies Used

Firebase &
NPM Dependencies &
Postman

## Installation

Clone this project repository 
Navigate to the project directory
Run npm install to install the necessary dependencies
Set up Firebase configuration by following the instructions in the documentation

## Usage

To use the project, follow these steps:

### Setting Up Firebase Configuration:

1) Create a Firebase project on the Firebase Console.
2) Goto your working directory and open terminal to login using "Firebase login".
3) Once logged-in, run the "Firebase init" to initiate the Firebase setup and to connect the working directory (local project) to the Firebase project.
4) Choose the Firebase project from list to connect the local project.
5) Select the feature you want to setup to your local project. For this project I added Firebase Functions and Firebase Firestore, and setup the rules and configuration accordingly.

### Testting API Endpoints:

With Postman, you can send requests to the API endpoints of your Firebase backend to ensure that they are functioning as expected.

### Deploying the Project:

Once satisfied with the local testing, deploy the project to Firebase Hosting using the command "firebase deploy --only functions".

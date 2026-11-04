# Tailor Shop App

This is our semester web project. It is a management app for a tailor shop where the
shop owner can keep the customers, their measurements, orders and the workers (kareegar)
salary at one place insted of a paper register.

This repo is our phase 1 submission.

## What is working in phase 1

For phase 1 we made the complete frontend and the sign up / login part of the backend.

- Sign up and login (with a verification code that is sent on email)
- Forgot password and reset password
- All the pages of the app are made - dashboard, customers, orders, employees (kareegar),
  suit types, expenses and settings

The rest of the backend (saving customers, orders etc) is not done yet, it is coming in
the next phase. So right now those pages open and you can see them but you cant save
anything, it will just show a message that the feature is not available yet.

## Tech used

- Frontend - React (vite)
- Backend - Node js with express
- Database - MongoDB (mongoose)
- JWT for the login and nodemailer for sending the email code

## How to run it

You need node js installed. MongoDB does not need to be installed, it starts a local one
by itself the first time (it downloads it one time, around 600mb so it takes a while).

First install everything

```
npm run setup
```

Then start it

```
npm run dev
```

Now open http://localhost:5173 in your browser.

The backend settings are in `backend/.env` (there is a `backend/.env.example` to copy from).
For the email code to actually send you have to put a gmail and its app password in there,
otherwise the code is just printed in the backend terminal which is fine for testing.

## Group members

- Qudama - 23L-0852
- Sachal - 23L-0973

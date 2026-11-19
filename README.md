# Tailor Shop App

This is our semester web project. It is a management app for a tailor shop where the
shop owner can keep the customers, their measurements, orders and the workers (kareegar)
salary at one place insted of a paper register.

This is the full project. In phase 1 we had done the frontend and the login part, in
phase 2 the whole backend is done so now everything is working.

## What it can do

- Sign up and login with a email verification code, forgot and reset password
- Add customers and save there measurements (the 13 naap with urdu names)
- Make orders with more than one suit, pick the kareegar, collar/cuff/pocket style,
  fabric photo and a voice note
- Order stages cutting, stitching, ready, delivered with urgent and late orders
- Advance and remaining balance and extra payments
- Send a whatsapp message to the customer (order ready, reminder etc) in urdu or english
- A tracking page so the customer can check there order
- Print the invoice, the kareegar work slip and the measurement card
- Kareegar salary with a different rate per suit type
- Suit types with price and kareegar pay
- Monthly expenses (rozamcha)
- Dashboard with a sales and expense chart

## Security (xss)

To stop xss attacks we clean the user input on the backend with sanitize-html so no html
or script tags get saved in the database, and the verification email is escaped with
escape-html before it is sent.

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

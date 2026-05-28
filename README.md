# PhonePe MERN Clone (Backend Only)

A simple, easy-to-understand Backend for a Easypay project. This system is heavily commented and uses beginner-friendly architectures while simulating a real-world FinTech application environment.

## 🌟 Full Feature Set
1. **User Authentication:** Strict JWT-based Register and Login system.
2. **Dynamic UPI IDs:** Newly registered users automatically receive a unique UPI tag (e.g., `saurabh354@phonepe`).
3. **Strict MPIN System:** All outbound transactions mathematically enforce a robust 4-digit MPIN verification layer. 
4. **Flexible Peer-to-Peer Transfers:** Send money directly to users by entering either their **10-digit Phone Number** OR their assigned **UPI ID**.
5. **Wallet Top-Up:** Simulate direct bank transfers by adding test deposits into a user's wallet via the Top-up route.
6. **Utility Bill Payments:** Mock endpoints for recharging Mobile Data or paying Electricity Bills. Recharges natively deduct wallet bounds while logging specialized `BILL_PAY` histories.
7. **Detailed Transaction Records:** See all history of deposits, withdrawals, utility bills, and friend transfers mapped recursively to the user logged in.
8. **Swagger User Interface:** A complete webpage auto-generating readable tables for all your available endpoints.
9. **Interactive Postman Library:** Complete endpoint repository fully equipped with auto-saving Environment token scripting out-of-the-box!

---

## 🛠 Tech Stack Used
- NodeJS & ExpressJS Framework
- MongoDB Memory System with Mongoose ORM
- BcryptJS (Password & MPIN ciphering)
- JSONWebToken (Session Validation)
- Swagger-UI (Auto Documentations)

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the command below in the main folder where `package.json` is located.
```bash
npm install
```

### 2. Configure Environment Variables
Inside your root folder, please ensure you have an `.env` file containing this strict outline:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/phonepe-clone
JWT_SECRET=super_secret_key_change_in_production
```
*(If you're deploying this or using Mongo Atlas, swap out `mongodb://127.0.0.1:27017/phonepe-clone` with your cloud URI connection string)*

### 3. Generate Swagger Document
Refresh the static UI configurations mapping to your local ports by executing:
```bash
npm run swagger
```

### 4. Seed Dummy Data (Highly Recommended)
We recommend loading our starter pack database so you don't have to repeatedly register fake accounts! Run:
```bash
npm run seed
```

**What gets seeded?**
- `amit@example.com` (Phone: 9876543210 | UPI: amit123@phonepe | Bal: 5000)
- `priya@example.com` (Phone: 9876543211 | UPI: priya456@phonepe | Bal: 3000)
- `rahul@example.com` (Phone: 9876543212 | UPI: rahul789@phonepe | Bal: 1500)
- `neha@example.com` (Phone: 9876543213 | UPI: neha012@phonepe | Bal: 8000)

**Global Credentials For these seeded accounts:** 
- Password: `password123` 
- MPIN: `1234`

### 5. Run the Server
Use one of the terminal triggers:
- **Production mode:** `npm start`
- **Development mode (Auto Restarts when editing):** `npm run dev`

Your backend ecosystem will permanently boot at `http://localhost:5000`.

---

## 📖 Available API Endpoints Summary

### Auth Routes (`/api/auth`)
- `POST /register`: Registers a user, hashes password, grants a randomized UPI string.
- `POST /login`: Validates password and issues the `Bearer` Token.
- `GET /profile`: Safely returns user context and checks if `hasMpinSet` is activated.
- `POST /setup-mpin`: Updates the system with a secured 4-digit PIN hash block. *(Requires Bearer Token)*

### Transaction & P2P Routes (`/api/transactions`)
- `POST /send`: Send real test funds. Takes `{ receiverIdentifier, amount, mpin }`. (`receiverIdentifier` can be standard phone digits OR a UPI block like `amit123@phonepe`). *(Requires Bearer Token)*
- `GET /history`: Dumps a historical JSON array isolating everything categorized under standard TRANSFERs and Bills mapped to standard dates. *(Requires Bearer Token)*

### Wallet & Utilities Routes (`/api/wallet`)
- `POST /add-money`: Loads `{amount}` numbers into the active user’s wallet securely. Maps an `ADD_MONEY` label on histories. *(Requires Bearer Token)*
- `POST /pay-bill`: Simulates external interactions by taking `{billerName, amount, mpin}` parameters reducing available floats. Maps under `BILL_PAY`. *(Requires Bearer Token)*

---

## 🔍 Interacting With Your API

### View Swagger Web Pages
Easily check what headers and schemas the models expect via your localhost URL:
`http://localhost:5000/api-docs`

### Connecting POSTMAN (Automated Testing)
1. Boot Postman Software.
2. Delete previous iterations of this project if present. 
3. Click on the gray **Import** Box.
4. Supply the provided file: `postman_collection.json`.
5. Open the **1. Authentication** folder and fire the **Login User** template.
6. Look closely at Postman's "Tests" Scripting block. It catches your active Login and invisibly injects the secret `Token` string back into the local environment setup named `{{token}}`. 
7. **Because of this logic**, you do not ever need to copy/paste Bearer configurations! You can immediately fire Top-ups, Money Requests, and Bill Pays. Let Postman handle the permissions for you out of the box!

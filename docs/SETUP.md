# Trimium Setup Guide

A comprehensive guide to set up and run the Trimium application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v18+ | Required |
| pnpm / npm / yarn | Latest | pnpm recommended |
| MongoDB | Latest | Local or cloud (e.g., MongoDB Atlas) |
| Redis | Latest | Local or cloud (e.g., Redis Cloud) |
| MaxMind GeoLite2 | Latest | Optional, enhances location services |

---

## 1. Clone the Repository

```bash
git clone https://github.com/IamDevTrivedi/Trimium
cd Trimium
```

---

## 2. Install Dependencies

From the root directory of the project, run:

```bash
# Using pnpm (recommended)
pnpm run install:all

# Using yarn
yarn run install:all

# Using npm
npm run install:all
```

---

## 3. Environment Configuration

### 3.1 Server Configuration

1. Navigate to the `server` directory
2. Create two environment files:
   - `.env.development` — for local development
   - `.env.production` — for production deployment
3. Copy the contents from [`.env.example`](../server/.env.example) into both files
4. Update the variables according to your setup

### 3.2 Client Configuration

1. Navigate to the `client` directory
2. Create a `.env` file
3. Copy the contents from [`.env.example`](../client/.env.example)
4. Update the variables according to your setup

---

## 4. GeoLite2 Database Setup (Optional)

> **Note:** This step is optional but recommended for production. Without the database, the application will fall back to an API-based geolocation service.

### Option A: Manual Download

1. Sign up for a free account at [MaxMind](https://www.maxmind.com/en/geolite2/signup)
2. Download the GeoLite2 City database from the [MaxMind Downloads](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data?lang=en) page
3. Extract the archive
4. Place the `GeoLite2-City.mmdb` file in:
   ```
   server/src/constants/GeoLite2-City.mmdb
   ```

### Option B: Automated Download

1. Obtain your license key from your [MaxMind Account](https://www.maxmind.com/en/accounts/current/license-key)

2. Set the environment variable:

   **Linux / macOS:**
   ```bash
   export MAXMIND_LICENSE_KEY=your_license_key_here
   ```

   **Windows (Command Prompt):**
   ```cmd
   set MAXMIND_LICENSE_KEY=your_license_key_here
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:MAXMIND_LICENSE_KEY="your_license_key_here"
   ```

3. Run the update script:
   ```bash
   node ./scripts/update-geolite2.js
   ```

4. Verify the file exists at `server/src/constants/GeoLite2-City.mmdb`

---

## 5. Running the Application

### Start Required Services

Ensure MongoDB and Redis are running before starting the application.

### Start Development Server

From the root directory:

```bash
# Using pnpm (recommended)
pnpm run dev

# Using yarn
yarn run dev

# Using npm
npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| Client | http://localhost:3000 |
| Server | http://localhost:`PORT` (as defined in your `.env` file) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check that all required environment variables are set correctly |
| MongoDB connection failed | Verify MongoDB is running and the connection string is correct |
| Redis connection failed | Verify Redis is running and the connection details are correct |
| GeoLite2 not working | Ensure the `.mmdb` file is in the correct location |

> **Note:** The server follows a fail-fast principle and will not start if environment variables are missing or misconfigured.

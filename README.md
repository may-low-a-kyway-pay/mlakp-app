# MLAKP App

MLAKP App is the Expo / React Native client for the MLAKP shared expense tracker. It connects to the MLAKP backend API for authentication, groups, dashboard balances, debt status changes, expense creation, debtor payment marking, and creditor payment review.

The app is built with Expo Router, React Native, TypeScript, axios, and feature-based folders under `src/modules`.

## Prerequisites

Install these before starting from a fresh machine:

- Git
- Node.js 20 or newer
- npm, included with Node.js
- Expo tooling through `npx expo`
- One runtime target:
  - Expo Go on a physical iOS or Android device
  - Android Studio emulator
  - iOS Simulator on macOS
  - Browser for web testing

This frontend expects the MLAKP backend API to be running. In the combined workspace, the backend is usually the sibling folder:

```bash
../mlakp-backend
```

## Clone The Project

Clone the repository and enter the app directory:

```bash
git clone <repo-url> mlakp-app
cd mlakp-app
```

## Install Dependencies

Install JavaScript dependencies from the lockfile:

```bash
npm install
```

## Configure Environment

Create your local environment file from the example:

```bash
cp .env.example .env
```

The app reads these variables at startup:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

`EXPO_PUBLIC_API_BASE_URL` is the backend API URL used by the shared axios client. Choose the value based on where the app runs:

```bash
# Web or iOS Simulator on the same machine as the backend
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080

# Android Emulator talking to a backend on the host machine
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080

# Physical device on the same Wi-Fi as your dev machine
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-lan-ip>:8080
```

Examples for finding your LAN IP:

```bash
# Linux
hostname -I

# macOS
ipconfig getifaddr en0
```

Restart Expo after changing `.env`. Expo only loads public environment variables when the dev server starts.

## Start The Backend

From the combined workspace, run the backend first:

```bash
cd ../mlakp-backend
cp .env.example .env
make migrate-up
make run
```

The expected default API base URL is:

```bash
http://localhost:8080
```

Check the backend README if your local database, port, or migration setup is different.

## Run The App

Start the Expo dev server:

```bash
npm start
```

Then choose a target from the Expo terminal:

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web
- Scan the QR code with Expo Go for a physical device

You can also use the direct scripts:

```bash
npm run android
npm run ios
npm run web
```

For a physical device outside normal LAN access, start Expo with tunnel mode:

```bash
npm run start:tunnel
```

## Verify The Setup

Run lint:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

To auto-format files:

```bash
npm run format
```

Basic manual verification:

1. Start the backend.
2. Start the Expo app.
3. Register or log in.
4. Open Dashboard and Groups.
5. Create a group.
6. Open Add Expense and submit an expense for selected group members.
7. Open All Balances from the dashboard and accept a pending debt as the debtor.
8. Mark a payment against an accepted debt.
9. Open Activity as the creditor and confirm or reject the pending payment.

If login fails immediately, confirm the app can reach `EXPO_PUBLIC_API_BASE_URL` from the selected device or emulator.

## Available Scripts

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm start`            | Start Expo dev server.                             |
| `npm run android`      | Start Expo and open Android target.                |
| `npm run ios`          | Start Expo and open iOS target.                    |
| `npm run web`          | Start Expo for web.                                |
| `npm run lint`         | Run Expo ESLint checks.                            |
| `npm run format`       | Format the project with Prettier.                  |
| `npm run format:check` | Check Prettier formatting without writing changes. |
| `npm run start:tunnel` | Start Expo with cache clear and tunnel mode.       |

## App Routes

Expo Router maps files in `app/` to screens:

```text
app/
  _layout.tsx              Root stack layout and navigation theme
  index.tsx                Login entry screen
  login.tsx                Login route
  register.tsx             Registration route
  add-expense.tsx          Add expense modal route
  debts.tsx                Full debt/balance list and debtor payment marking
  (tabs)/
    _layout.tsx            Bottom tab layout
    dashboard.tsx          Dashboard tab
    groups.tsx             Groups tab
    activity.tsx           Activity tab
    settings.tsx           Settings tab
```

The root stack starts at `login`, then navigates into the tab group after authentication.

## Folder Structure

```text
.
  app/                     Expo Router route files
  assets/                  App icons, splash image, favicon, and static images
  src/
    modules/               Feature modules
      auth/                Login, register, logout, auth session storage, auth API calls
      dashboard/           Dashboard totals, unsettled balances, debt accept/reject actions
      groups/              Group list/detail UI, group API calls, member display helpers
      expense/             Add expense UI, split payload builder, expense API calls
      debts/               Full balance list, debt filters, debt accept/reject, and payment marking
      payments/            Payment API calls and payment response types
      activity/            Payment inbox, submitted payment list, and payment review history
      settings/            Settings tab UI and sign-out action
      users/               User search API used by group member workflows
    shared/                Cross-feature code
      api/                 Shared axios API client and auth header attachment
      components/          Reusable screen, card, avatar, and header components
      theme/               Shared color tokens
  app.json                 Expo application configuration
  eslint.config.js         Expo ESLint configuration
  package.json             npm scripts and dependencies
  package-lock.json        Locked dependency versions
  tsconfig.json            TypeScript configuration and path aliases
  .env.example             Environment variable template
```

## Feature Module Pattern

Most feature folders follow the same shape:

```text
src/modules/<feature>/
  api/                     HTTP calls for the feature
  hooks/                   Screen state and feature workflows
  screens/                 React Native screen components and styles
  types/                   API and UI TypeScript types
  utils/                   Formatting and mapping helpers
```

Not every feature needs every folder. Keep new code close to the feature that owns it. Put only truly reusable code under `src/shared`.

## API Layer

All HTTP traffic goes through:

```text
src/shared/api/client.ts
```

That client:

- requires `EXPO_PUBLIC_API_BASE_URL`
- requires positive numeric `EXPO_PUBLIC_API_TIMEOUT_MS`
- sends `Accept: application/json`
- sends `Content-Type: application/json`
- attaches `Authorization: Bearer <token>` when an access token exists

Feature API files describe endpoint-specific requests:

```text
src/modules/auth/api/authApi.ts       /v1/auth/login, /v1/auth/register, /v1/auth/logout
src/modules/dashboard/api/dashboardApi.ts  /v1/dashboard, /v1/debts/{debtID}
src/modules/debts/api/debtsApi.ts     /v1/debts
src/modules/groups/api/groupsApi.ts   /v1/groups, /v1/groups/{groupID}
src/modules/expense/api/expenseApi.ts /v1/expenses
src/modules/payments/api/paymentsApi.ts /v1/payments, /v1/debts/{debtID}/payments
src/modules/users/api/usersApi.ts     /v1/users/search
```

## Current Product Flows

### Authentication

- `app/index.tsx` and `app/login.tsx` show the login experience.
- `app/register.tsx` handles registration.
- Successful auth stores tokens through `src/modules/auth/services/authSession.ts`.
- Settings sign-out calls backend logout and clears the local session.

### Groups

- The Groups tab defaults to the current user's groups.
- The People segment provides username search and inline username copy.
- Group details can show members and pending add-member UI.
- User search is backed by `/v1/users/search`.

### Expense Creation

- `app/add-expense.tsx` opens the Add Expense workflow.
- The payer is locked to the current user.
- The user chooses a group and selects participants from group members.
- Supported split modes are equal and manual exact amounts.
- Expense creation calls `/v1/expenses`; the backend creates pending debt rows for selected participants.

### Debts And Balances

- Dashboard shows total `you_owe`, total `you_get`, and an unsettled balance preview.
- `app/debts.tsx` shows the full debt list.
- Filters:
  - type: `All`, `You Owe`, `You Get`
  - status: `All`, `Pending`, `Accepted`, `Partial`, `Settled`, `Rejected`
- Debtors can accept or reject pending debt requests.
- Debtors can mark payment only for accepted or partially settled debts.
- If a payment is already pending creditor review for a debt, the app shows `Payment pending review` instead of another Mark Payment action.

### Payments And Activity

- The Activity tab is the payment inbox.
- `To review` lists pending payments received by the current user as creditor.
- `Submitted` lists pending payments sent by the current user as debtor.
- `History` lists confirmed and rejected payment records, with `All`, `Confirmed`, and `Rejected` subfilters.
- Creditors confirm or reject pending payments from Activity.
- Confirming a payment updates the debt balance on the backend.
- Rejecting a payment leaves the debt amount unchanged and allows the debtor to submit again.

## Path Aliases

The project uses the `@/` alias for imports from the project root:

```ts
import { apiClient } from '@/src/shared/api/client'
```

Prefer this style over long relative imports for app and source files.

## Development Notes

- Keep backend response contracts aligned with the TypeScript types under each module.
- Restart Expo after changing `.env`.
- Use `10.0.2.2` for Android emulator access to a backend running on the host machine.
- Use your computer LAN IP for a physical device.
- Keep generated Expo cache and local environment files out of commits.

## Troubleshooting

### Missing environment variable

If the app throws `Missing required environment variable`, confirm `.env` exists and includes:

```bash
EXPO_PUBLIC_API_BASE_URL=...
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

Then restart Expo.

### Android emulator cannot reach backend

Use:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

`localhost` inside the Android emulator points to the emulator itself, not your computer.

### Physical device cannot reach backend

Use your computer LAN IP:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080
```

Make sure the phone and computer are on the same Wi-Fi and the backend listens on an address reachable from the network.

### Expo tunnel is slow or unavailable

Prefer normal LAN mode when the device and computer are on the same network. Use tunnel mode only when LAN access is blocked:

```bash
npm run start:tunnel
```

### API returns 401

Log in again from the app. The shared API client attaches the saved access token automatically when one exists.

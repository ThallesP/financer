# Financer

⚠️ **WIP: This project is a work in progress. Use at your own risk.** ⚠️

Financer is a financial automation tool that connects to your bank accounts via Pluggy and syncs transactions to a Maybe Finance account.

## Features

- Automatically fetches transactions from your bank accounts
- Syncs transactions to Maybe Finance
- Avoids duplicate entries by tracking previously synced transactions
- Supports checking accounts with both inflow and outflow transactions

## Prerequisites

- [Bun](https://bun.sh) v1.2.8 or later
- Pluggy API credentials
- Maybe Finance account
- PostgreSQL database

## Installation

1. Clone the repository:

```bash
git clone https://github.com/thallesp/financer.git
cd financer
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables by creating a `.env` file:

```env
# Pluggy API credentials
PLUGGY_CLIENT_ID=your_pluggy_client_id
PLUGGY_CLIENT_SECRET=your_pluggy_client_secret
PLUGGY_CONNECTOR_ID=your_pluggy_connector_id

# Maybe Finance credentials
MAYBE_APP_URL=https://app.maybe.co
MAYBE_EMAIL=your_email@example.com
MAYBE_PASSWORD=your_password
MAYBE_CHECKING_ACCOUNT_ID=your_maybe_account_id

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/financer
```

4. Initialize the database:

```bash
bun prisma db push
```

## Usage

To run the transaction sync:

```bash
bun run index.ts
```

You can set up a cron job to run this script periodically to keep your transactions in sync.

## How It Works

1. Connects to Pluggy API using your credentials
2. Fetches all checking account transactions
3. For each transaction, checks if it already exists in Maybe Finance
4. Creates new transactions in Maybe Finance for any that don't exist yet

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

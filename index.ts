import { PluggyClient } from "pluggy-sdk";
import { env } from "./env";
import { MaybeService } from "./maybe";
import { PrismaClient } from "./generated/prisma";
import logger from "pino";

const log = logger({
	level: "info",
});

log.info("Starting");

const client = new PluggyClient({
	clientId: env.PLUGGY_CLIENT_ID,
	clientSecret: env.PLUGGY_CLIENT_SECRET,
});

const prisma = new PrismaClient();
const maybeService = new MaybeService();
await maybeService.login();

log.info("Logged in");

const accounts = await client.fetchAccounts(env.PLUGGY_CONNECTOR_ID);

log.info("Fetched accounts", {
	total: accounts.results.length,
});

for (const account of accounts.results) {
	if (account.subtype !== "CHECKING_ACCOUNT") continue;

	let page = 1;
	while (true) {
		const transactions = await client.fetchTransactions(account.id, {
			pageSize: 500,
			page,
		});

		log.info("Fetched transactions", {
			total: transactions.results.length,
		});

		for (const {
			id,
			description,
			amount,
			date,
			type,
		} of transactions.results) {
			const entry = await prisma.entries.findFirst({
				where: {
					notes: id,
				},
			});

			if (entry) continue;

			log.info(
				{
					date,
					type,
					id,
				},
				"Creating transaction",
			);

			await maybeService.createTransaction({
				nature: type === "DEBIT" ? "outflow" : "inflow",
				entryableType: "Transaction",
				name: description,
				account: "CHECKING_ACCOUNT",
				amount: Math.abs(amount),
				timestamp: new Date(date),
				notes: id,
			});

			log.info("Created transaction", {
				date,
				type,
				id,
			});
		}

		if (transactions.totalPages === page) break;

		page++;
	}

	log.info("Finished", {
		accountId: account.id,
	});
}

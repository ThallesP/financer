import { PluggyClient } from "pluggy-sdk";
import { env } from "./env";
import { MaybeService } from "./maybe";
import { PrismaClient } from "./generated/prisma";

const client = new PluggyClient({
	clientId: env.PLUGGY_CLIENT_ID,
	clientSecret: env.PLUGGY_CLIENT_SECRET,
});

const prisma = new PrismaClient();
const maybeService = new MaybeService();
await maybeService.login();

const accounts = await client.fetchAccounts(env.PLUGGY_CONNECTOR_ID);

for (const account of accounts.results) {
	if (account.subtype !== "CHECKING_ACCOUNT") continue;

	let page = 1;
	while (true) {
		const transactions = await client.fetchTransactions(account.id, {
			pageSize: 500,
			page,
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

			await maybeService.createTransaction({
				nature: type === "DEBIT" ? "outflow" : "inflow",
				entryableType: "Transaction",
				name: description,
				account: "CHECKING_ACCOUNT",
				amount: Math.abs(amount),
				timestamp: new Date(date),
				notes: id,
			});
		}

		if (transactions.totalPages === page) break;

		page++;
	}
}

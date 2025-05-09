import { got, type Got } from "got";
import { env } from "./env";
import { CookieJar } from "tough-cookie";
import { load } from "cheerio";

type CreateTransactionProps = {
	nature: "outflow" | "inflow";
	entryableType: "Transaction";
	name: string;
	account: "CHECKING_ACCOUNT";
	amount: number;
	timestamp: Date;
	notes?: string;
};

type CreateCategoryProps = {
	color: string; // e.g. "#805dee"
	classification: "expense" | "income";
	name: string;
	parent_id?: string;
	transaction_id?: string;
};

export class MaybeService {
	private readonly client: Got;
	private readonly cookieJar: CookieJar;

	constructor() {
		this.cookieJar = new CookieJar();
		this.client = got.extend({
			prefixUrl: env.MAYBE_APP_URL,
			cookieJar: this.cookieJar,
		});
	}

	private async getAuthenticityToken(path?: string) {
		const { body: csrfBody } = await this.client.get(path ?? "sessions/new");

		const $ = load(csrfBody);

		const formAuthenticityToken = $('input[name="authenticity_token"]').val();
		const metaAuthenticityToken = $('meta[name="csrf-token"]').attr("content");

		return { formAuthenticityToken, metaAuthenticityToken };
	}

	async login() {
		const { formAuthenticityToken } =
			await this.getAuthenticityToken("sessions/new");

		await this.client.post("sessions", {
			form: {
				authenticity_token: formAuthenticityToken,
				email: env.MAYBE_EMAIL,
				password: env.MAYBE_PASSWORD,
			},
			followRedirect: false,
		});
	}

	async createTransaction({
		nature,
		entryableType,
		name,
		amount,
		timestamp,
		notes,
	}: CreateTransactionProps) {
		const { formAuthenticityToken, metaAuthenticityToken } =
			await this.getAuthenticityToken("transactions/new");

		await this.client.post("transactions", {
			form: {
				authenticity_token: formAuthenticityToken,
				"entry[nature]": nature,
				"entry[entryable_type]": entryableType,
				"entry[name]": name,
				"entry[account_id]": env.MAYBE_CHECKING_ACCOUNT_ID,
				"entry[amount]": amount,
				"entry[currency]": "BRL",
				"entry[date]": timestamp.toISOString().slice(0, 10),
				"entry[entryable_attributes][tag_ids][]": "",
				"entry[notes]": notes ?? "",
			},
			headers: {
				"X-CSRF-Token": metaAuthenticityToken,
			},
			followRedirect: false,
		});
	}

	async createCategory({
		color,
		classification,
		name,
		parent_id,
		transaction_id,
	}: CreateCategoryProps) {
		const { formAuthenticityToken, metaAuthenticityToken } =
			await this.getAuthenticityToken("categories/new");

		await this.client.post("categories", {
			form: {
				authenticity_token: formAuthenticityToken,
				"category[color]": color,
				"category[classification]": classification,
				"category[name]": name,
				"category[parent_id]": parent_id ?? "",
				transaction_id: transaction_id ?? "",
			},
			headers: {
				"X-CSRF-Token": metaAuthenticityToken,
			},
			followRedirect: false,
		});
	}
}

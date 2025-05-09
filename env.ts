import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		PLUGGY_CLIENT_ID: z.string().min(1),
		PLUGGY_CLIENT_SECRET: z.string().min(1),
		MAYBE_APP_URL: z.string().url(),
		MAYBE_EMAIL: z.string().email(),
		MAYBE_PASSWORD: z.string(),
		DATABASE_URL: z.string().url(),
		PLUGGY_CONNECTOR_ID: z.string(),
		MAYBE_CHECKING_ACCOUNT_ID: z.string(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});

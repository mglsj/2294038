// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
	base: "/",
	output: "server",

	adapter: node({
		mode: "standalone",
	}),

	integrations: [db()],
});

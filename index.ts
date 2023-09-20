import { parse } from "set-cookie-parser";

type Options = FetchRequestInit & { cookies?: Record<string, string> };

interface HttpClientOptions {
	headers?: Record<string, string>;
	jar?: boolean;
	cookies?: Record<string, string>;
}

function buildCookies(cookies: Record<string, string>) {
	return Object.entries(cookies)
		.map(([key, value]) => `${key}=${value}`)
		.join("; ");
}

export class HttpClient {
	cookies: Record<string, string> = {};
	headers: Record<string, string>;
	jar: boolean;

	constructor(options?: HttpClientOptions) {
		// this.headers = headers || {};
		this.headers = options?.headers || {};
		this.cookies = options?.cookies || {};
		this.jar = options?.jar || false;
	}

	async request(method: string, url: string, opts: Options) {
		const { headers: requestHeaders, cookies, ...options } = opts;

		const response = await fetch(url, {
			method,
			headers: {
				Cookie: buildCookies({ ...this.cookies, ...cookies }),
				...this.headers,
				...requestHeaders,
			},
			...options,
		});

		this.cookies = Object.fromEntries(
			response.headers.getAll("set-cookie").flatMap((cookie) => {
				const cookie_ = parse(cookie);

				return cookie_.map((cookie__) => [cookie__.name, cookie__.value]);
			}),
		);

		return response;
	}

	get(url: string, opts?: Options) {
		return this.request("GET", url, opts || {});
	}

	post(url: string, opts?: Options) {
		return this.request("POST", url, opts || {});
	}

	put(url: string, opts?: Options) {
		return this.request("PUT", url, opts || {});
	}

	option(url: string, opts?: Options) {
		return this.request("OPTION", url, opts || {});
	}
}

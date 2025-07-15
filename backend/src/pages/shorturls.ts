import type { APIRoute } from "astro";
import { CodeUtils } from "../lib/code";
import {
    StatusCodes
} from 'http-status-codes';

import { z } from "astro:content";


const RequestSchema = z.object({
    url: z.string().url(),
    validity: z.number().int().default(30),
    shortCode: z.string().optional(),
});


export const POST: APIRoute = async ({ params, request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        const body = await request.json();

        const parsed = RequestSchema.safeParse(body);

        if (parsed.error) {
            return new Response(
                JSON.stringify({
                    error: parsed.error.message,
                }),
                {
                    status: StatusCodes.BAD_REQUEST,
                },
            );
        }

        const { url, validity, shortCode } = parsed.data;

        if (shortCode) {
            const code = await CodeUtils.getCode(shortCode);
            if (code) {
                // Already exists
                return new Response(
                    JSON.stringify({
                        error: "Short code already exists",
                    }),
                    {
                        status: StatusCodes.CONFLICT,
                    },
                );
            }
        }

        const code = await CodeUtils.createCode(shortCode, url, validity);

        if (!code) {
            return new Response(
                JSON.stringify({
                    error: "Failed to create short code",
                }),
                {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                },
            );
        }

        const urlObj = new URL(request.url);

        return new Response(
            JSON.stringify({
                shortLink: `${urlObj.origin}/${code.shortCode}`,
                expiry: code.expiry.toISOString(),
            }),
            {
                status: StatusCodes.CREATED,
            },
        );
    }

    return new Response(
        JSON.stringify({
            message: "Only JSON requests are supported.",
        }),
        {
            status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        }
    );
}
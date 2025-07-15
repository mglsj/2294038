import type { APIRoute } from "astro";
import { StatusCodes } from "http-status-codes";
import { CodeUtils } from "../lib/code";

export const GET: APIRoute = async ({ params, request }) => {
    const shortCode = params.shortCode;

    if (!shortCode) {
        return new Response(
            JSON.stringify({ error: "Short code is required" }),
            { status: StatusCodes.BAD_REQUEST }
        );
    }

    const codeData = await CodeUtils.getCode(shortCode);

    if (!codeData) {
        return new Response(
            JSON.stringify({ error: "Short code not found or expired" }),
            { status: StatusCodes.NOT_FOUND }
        );
    }


    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

    await CodeUtils.click(codeData.shortCode, request.referrer, ip);

    return Response.redirect(codeData.url, 302);
}
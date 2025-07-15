import { db, eq, CodeTable } from 'astro:db';

type CodeData = {
    shortCode: string;
    url: string;
    expiry: Date;
};

export namespace CodeUtils {
    export async function getCode(code: string): Promise<CodeData | null> {

        const row = await db.select({
            code: CodeTable.code,
            url: CodeTable.url,
            expiry: CodeTable.expiry
        }).from(CodeTable).where(eq(CodeTable.code, code));

        if (row.length === 0) {
            return null; // No code found
        }

        const result = row[0];

        if (result.expiry < new Date()) {
            // delete code if expired
            await db.delete(CodeTable).where(eq(CodeTable.code, code));
            return null;
        }

        return {
            shortCode: result.code,
            url: result.url,
            expiry: result.expiry
        };
    }

    export async function createCode(shortCode: string | undefined, url: string, validity: number): Promise<CodeData | null> {

        if (shortCode === undefined || shortCode.trim() === '') {
            // Generate a random short code if not provided
            const shortid = require('shortid');
            shortCode = shortid.generate();
        }

        // expiry = current date + validity in minutes
        const expiry = new Date(Date.now() + validity * 60 * 1000);

        const row = await db.insert(CodeTable).values({
            shortCode,
            url,
            expiry
        }).returning({
            shortCode: CodeTable.shortCode,
            url: CodeTable.url,
            expiry: CodeTable.expiry
        });

        if (row.length === 0) {
            return null; // Insertion failed
        }

        return row[0];
    }

}
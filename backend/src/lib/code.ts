import { db, eq, CodeTable, ClickTable } from 'astro:db';
import shortid from 'shortid';
import { Log } from 'logger';

type CodeData = {
    shortCode: string;
    url: string;
    expiry: Date;
};

type ClickData = {
    shortCode: string;
    timestamp: Date;
    referer: string;
    location: string | null;
};

export namespace CodeUtils {

    export async function getCode(code: string): Promise<CodeData | null> {

        const row = await db.select({
            code: CodeTable.shortCode,
            url: CodeTable.url,
            expiry: CodeTable.expiry
        }).from(CodeTable).where(eq(CodeTable.shortCode, code));

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

    export async function click(shortCode: string, referer: string, location: string | null): Promise<void> {
        const timestamp = new Date();

        await db.insert(ClickTable).values({
            shortCode,
            timestamp,
            referer,
            location
        });

        Logger

    }

    export async function getClicks(shortCode: string): Promise<ClickData[]> {
        const rows = await db.select({
            shortCode: ClickTable.shortCode,
            timestamp: ClickTable.timestamp,
            referer: ClickTable.referer,
            location: ClickTable.location
        }).from(ClickTable).where(eq(ClickTable.shortCode, shortCode));

        return rows;
    }

}
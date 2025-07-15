import { defineDb, defineTable, column } from "astro:db";

const CodeTable = defineTable({
    columns: {
        shortCode: column.text({ primaryKey: true }),
        url: column.text(),
        expiry: column.date(),
    }
})

const ClickTable = defineTable({
    columns: {
        shortCode: column.text(),
        timestamp: column.date(),
        referer: column.text(),
        location: column.text({ optional: true }),
    },
});

export default defineDb({
    tables: {
        CodeTable,
        ClickTable,
    },
});
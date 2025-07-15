import { defineDb, defineTable, column } from "astro:db";

const CodeTable = defineTable({
    columns: {
        shortCode: column.text({ primaryKey: true }),
        url: column.text(),
        expiry: column.date(),
    }
})

export default defineDb({
    tables: {
        CodeTable,
    },
});
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const signatureTable = pgTable("signature", {
    id: uuid("id").defaultRandom().primaryKey(),
    image: text("image").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
})
import { tableNames } from "../knex/tableNames.js";

export const up = async function (knex) {
    const exists = await knex.schema.hasTable(tableNames.cart_item);

    if (!exists) {
        return knex.schema.createTable(tableNames.cart_item, (t) => {
            t.bigIncrements("id").primary();

            t.bigInteger("cart_id").unsigned().notNullable();
            t.foreign("cart_id")
                .references("id")
                .inTable(tableNames.carts)
                .onDelete("CASCADE");

            t.bigInteger("user_id").unsigned().notNullable();
            t.foreign("user_id")
                .references("id")
                .inTable(tableNames.users)
                .onDelete("CASCADE");

            t.bigInteger("menu_item_id").unsigned().notNullable();
            t.foreign("menu_item_id")
                .references("id")
                .inTable(tableNames.menu_item)
                .onDelete("RESTRICT");

            t.integer("quantity").notNullable();

            t.index(["user_id"]);
        });
    }
};

export const down = function (knex) {
    return knex.schema.dropTable(tableNames.cart_item);
};

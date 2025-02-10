import { tableNames } from "../knex/tableNames.js";

export const up = async function (knex) {
    const exists = await knex.schema.hasTable(tableNames.carts);

    if (!exists) {
        return knex.schema.createTable(tableNames.carts, (t) => {
            t.bigIncrements("id").primary(); // Identificador único para o item do pedido
            t.bigInteger("restaurant_id").unsigned().notNullable(); // Referência ao pedido
            t.foreign("restaurant_id")
                .references("id")
                .inTable(tableNames.restaurants)
                .onDelete("CASCADE");

            t.bigInteger("user_id").unsigned().notNullable(); // Referência ao pedido
            t.foreign("user_id")
                .references("id")
                .inTable(tableNames.users)
                .onDelete("CASCADE");

            t.string("status", 20).notNullable();
            t.timestamp("created_at").defaultTo(knex.fn.now());

            t.index(["user_id"]);
        });
    }
};

export const down = function (knex) {
    return knex.schema.dropTable("cart");
};

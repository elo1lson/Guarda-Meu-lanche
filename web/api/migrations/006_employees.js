import { tableNames } from "../knex/tableNames.js";

export const up = function (knex) {
    return knex.schema.createTable(tableNames.employees, (t) => {
        t.bigIncrements("id").primary().notNullable();
        t.bigInteger("user_id");
        t.bigInteger("restaurant_id");
        t.bigInteger("position");

        t.foreign("restaurant_id").references("id").inTable(tableNames.users);
        t.foreign("user_id").references("id").inTable(tableNames.users);
        t.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

export const down = function (knex) {
    return knex.schema.dropTable(tableNames.employees);
};

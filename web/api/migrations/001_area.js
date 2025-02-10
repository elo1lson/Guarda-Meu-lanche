import { tableNames } from "../knex/tableNames.js";

export const up = async function (knex) {
    const exists = await knex.schema.hasTable(tableNames.food_area);
    if (!exists) {
  return knex.schema.createTable(tableNames.food_area, (t) => {
    t.bigIncrements("id").primary();
    t.string("name", 70).unique().notNullable();
  });}
};

export const down = function (knex) {
  return knex.schema.dropTable(tableNames.food_area);
};

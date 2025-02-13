import { BAD_REQUEST, StatusCodes } from "http-status-codes";
import { Knex } from "../../knex/knex.js";
import { handleError } from "../handlers/handleServerError.js";
import { raw } from "express";
import knex from "knex";

//#region
const checkUser = async (id) => await Knex("users").where({ id }).first();
const checkRestaurant = async (id) =>
    await Knex("restaurants").where({ id }).first();

const hasItemOnRestaurant = async (restaurant_id, id) =>
    await Knex("menu_item").where({ restaurant_id, id }).first();

//#endregion

const getTotalPrice = async (item) => {
    let totalOrderPrice = 0;

    const getDatabasePrice = item.map(async (i) => {
        const quantity = i.quantity;

        const [item_price] = await Knex("menu_item")
            .where({ id: i.menu_item_id })
            .select("price");

        const totalItemPrice = quantity * Number(item_price.price);
        totalOrderPrice += totalItemPrice;
    });

    await Promise.all(getDatabasePrice);

    return totalOrderPrice;
};
const getCartFromDatabase = async (user_id) => {
    try {
        const cart = await Knex("carts")
            .join("cart_item", "carts.id", "cart_item.cart_id")
            .join("menu_item", "cart_item.menu_item_id", "menu_item.id")
            .join("restaurants", "menu_item.restaurant_id", "restaurants.id")
            .where({ "carts.user_id": user_id })
            .select(
                "cart_item.menu_item_id",
                "cart_item.quantity",
                "cart_item.cart_id",
                "carts.status",
                "carts.created_at",
                "carts.restaurant_id",
                "carts.user_id",
                "carts.status",
                "menu_item.price",
                "menu_item.desc",
                "menu_item.url",
                "menu_item.name",
                "restaurants.name as restaurant_name",
                "restaurants.area_id",
                Knex.raw("cart_item.quantity * menu_item.price AS total_price")
            );

        const groupedCart = Object.values(
            cart.reduce((acc, item) => {
                if (!acc[item.cart_id]) {
                    acc[item.cart_id] = {
                        cart_id: item.cart_id,
                        restaurant_id: item.restaurant_id,
                        restaurant_name: item.restaurant_name,
                        restaurant_area: item.area_id,
                        status: item.status,
                        cart_value: 999,

                        items: [], // Inicializa como array
                    };
                }

                acc[item.cart_id].items.push({
                    menu_item_id: item.menu_item_id,
                    name: item.name,
                    desc: item.desc,
                    image_url: item.url,
                    price: item.price,
                    quantity: item.quantity,
                    total_price: item.total_price,
                });

                return acc;
            }, {})
        );

        return {
            length: groupedCart.length,
            cart: groupedCart,
        };
    } catch (error) {
        console.log(error);

        throw {
            status: StatusCodes.BAD_REQUEST,
            error: "Erro ao obter o carrinho",
        };
    }
};



export const getCart = async (req, res) => {
    try {
        const { credentials } = req;

        const user = await checkUser(credentials.id);

        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "usuário não encontrado" });
        }

        const cart = await getCartFromDatabase(credentials.id);

        if (!cart) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "nenhum carrinho encontrado" });
        }

        return res.status(StatusCodes.OK).json(cart);
    } catch (e) {
        return handleError({ r: res, e });
    }
};

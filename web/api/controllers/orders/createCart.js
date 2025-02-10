import { StatusCodes } from "http-status-codes";
import { Knex } from "../../knex/knex.js";
import yup from "yup";
import validation from "../../middlewares/validation.js";
import { handleError } from "../handlers/handleServerError.js";


export const cartValidation = validation((schema) => ({
    body: yup
        .object()
        .shape({
            restaurant_id: yup.number().required(),
            items: yup
                .array()
                .of(
                    yup.object().shape({
                        id: yup.number().positive().integer().required(),
                        quantity: yup.number().positive().integer().required(),
                    })
                )
                .required()
                .min(1, "O carrinho deve ter pelo menos 1 item.") // Validação para garantir pelo menos 1 item
                .test(
                    "items-length",
                    "O carrinho não pode ter mais de 10 itens",
                    (items) => items && items.length <= 10 // Limite de itens, por exemplo, 10 itens no máximo
                ),
        })
        .noUnknown(true, "Chaves adicionais não são permitidas."),
}));

const checkUser = async (id) => await Knex("users").where({ id }).first();

const checkCart = async (user_id, restaurant_id) =>
    await Knex("carts")
        .where({ user_id, restaurant_id, status: "active" })
        .first();

const checkRestaurant = async (id) =>
    await Knex("restaurants").where({ id }).first();

const consolidateItems = (items) => {
    const consolidated = {};
    items.forEach((item) => {
        if (consolidated[item.id]) {
            consolidated[item.id] += item.quantity;
        } else {
            consolidated[item.id] = item.quantity;
        }
    });
    return Object.entries(consolidated).map(([id, quantity]) => ({
        id: Number(id),
        quantity,
    }));
};

const newCart = async ({ restaurant_id, items, user_id }) => {
    try {
        const [cart] = await Knex("carts")
            .insert({
                restaurant_id,
                user_id,
                status: "active",
            })
            .returning("*");

        return cart;
    } catch (error) {
        console.log(error);

        throw {
            status: StatusCodes.BAD_REQUEST,
            error: "erro ao criar o carrinho",
        };
    }
};

const validateItems = async (restaurant_id, items) => {
    console.log(restaurant_id, "line 149");

    const validItems = await Knex("menu_item")
        .whereIn(
            "id",
            items.map((item) => item.id)
        )
        .andWhere({ restaurant_id });

    if (validItems.length !== items.length) {
        throw {
            status: StatusCodes.BAD_REQUEST,
            message: "Um ou mais itens não pertencem ao restaurante.",
        };
    }
};

const insertItems = async (cart_, items, user_id) => {
    items = consolidateItems(items);

    let cart_id = cart_.id;
    let restaurant_id = cart_.restaurant_id;

    await validateItems(restaurant_id, items);

    const sortItems = items.map((i) => {
        return {
            menu_item_id: i.id,
            quantity: i.quantity,
            cart_id,
            user_id,
        };
    });

    const cart = await Knex("cart_item").insert(sortItems).returning("*");

    return cart;
};


export const createCart = async (req, res) => {
    try {
        const { credentials, body } = req;
        const { restaurant_id, items } = body;

        const user = await checkUser(credentials.id);

        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "usuário não encontrado" });
        }

        let cart;

        const restaurant = await checkRestaurant(restaurant_id);
        if (!restaurant) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "restaurante não encontrado" });
        }

        const cartExists = await checkCart(credentials.id, restaurant_id);

        if (cartExists) {
            return res
                .status(StatusCodes.NOT_ACCEPTABLE)
                .json({
                    status: StatusCodes.NOT_ACCEPTABLE,
                    message: "já existe um carrinho para esse restaurante",
                });
        }

        const payload = { restaurant_id, items, user_id: credentials.id };
        cart = await newCart(payload);

        cart = await insertItems(cart, items, cart.user_id);

        return res.status(StatusCodes.OK).json(cart);
    } catch (e) {
        return handleError({ r: res, e });
    }
};

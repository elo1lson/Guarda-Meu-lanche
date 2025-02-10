import { StatusCodes } from "http-status-codes";
import { Knex } from "../../knex/knex.js";
import yup from "yup";
import validation from "../../middlewares/validation.js";
import { handleError } from "../handlers/handleServerError.js";

const arraySchema = yup.object().shape({
    id: yup.number().positive().integer().positive(),
    quantity: yup.number().positive().integer().positive(),
});

export const findCartValidation = validation((schema) => ({
    params: yup
        .object()
        .shape({
            restaurant_id: yup.number().required(),
        })
        .noUnknown(true, "Chaves adicionais não são permitidas."),
}));

const checkUser = async (id) => await Knex("users").where({ id }).first();

const checkCart = async (restaurant_id, user_id) =>
    await Knex("carts").where({ restaurant_id, user_id }).first();

const getCartFromDatabase = async ({ restaurant_id }) => {
    try {
        const cart = await Knex("carts")
            .join("cart_item", "carts.id", "cart_item.cart_id")
            .join("menu_item", "cart_item.menu_item_id", "menu_item.id")
            .join("restaurants", "menu_item.restaurant_id", "restaurants.id")
            .where({ "carts.restaurant_id": restaurant_id })
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

export const getCartById = async (req, res) => {
    try {
        const { credentials } = req;
        const { restaurant_id } = req.params;

        const user = await checkUser(credentials.id);

        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "usuário não encontrado" });
        }

        const cart = await checkCart(restaurant_id, credentials.id);
        if (!cart) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.NOT_FOUND,
                message: "carrinho não encontrado",
            });
        }

        let cartResponse = await getCartFromDatabase({ restaurant_id });

        return res.status(StatusCodes.OK).json(cartResponse);

        const payload = { restaurant_id, items, user_id: credentials.id };
        cart = await newCart(payload);

        cart = await insertItems(cart, items, cart.user_id);

        return res.status(StatusCodes.OK).json(cart);
    } catch (e) {
        return handleError({ r: res, e });
    }
};

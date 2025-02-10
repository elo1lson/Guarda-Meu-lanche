import { StatusCodes } from "http-status-codes";
import { Knex } from "../../knex/knex.js";
import { handleError } from "../handlers/handleServerError.js";
import validation from "../../middlewares/validation.js";
import yup from "yup";

export const updateCartValidation = validation((schema) => ({
    params: yup
        .object()
        .shape({
            restaurant_id: yup.number().required(),
        })
        .noUnknown(true, "Chaves adicionais não são permitidas."),
    body: yup
        .object()
        .shape({
            cart_id: yup.number().required(),
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

const checkCart = async (restaurant_id, user_id) =>
    await Knex("carts").where({ restaurant_id, user_id }).first();

const updateCartFromDatabase = async (cart_id, items) => {
    try {
        const updated_items = [];

        for (const item of items) {
            const updatedItem = await Knex("cart_item")
                .where({ cart_id, menu_item_id: item.id })
                .update({ quantity: item.quantity })
                .returning("*");

            updated_items.push(updatedItem[0]);
        }

        return {
            cart_id,
            updated_items,
        };
    } catch (error) {
        console.error(error);

        throw {
            status: StatusCodes.BAD_REQUEST,
            error: "Erro ao atualizar os itens do carrinho",
        };
    }
};

export const updateCart = async (req, res) => {
    try {
        const { credentials, body, params } = req;
        const { restaurant_id } = params;
        const { cart_id, items } = body;

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

        const updatedCart = await updateCartFromDatabase(cart_id, items);

        return res.status(StatusCodes.OK).json(updatedCart);
    } catch (e) {
        return handleError({ r: res, e });
    }
};

import yup from "yup";
import validation from "../../middlewares/validation.js";
import { Knex } from "../../knex/knex.js";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../handlers/handleServerError.js";
import { checkFoodAreaExists } from "./shared/checkFoodAreaExists.js";

/**
 * @swagger
 * /restaurants/items:
 *   post:
 *     summary: Adiciona um novo item ao menu do restaurante
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do item do menu
 *                 example: "Pizza Margherita"
 *               desc:
 *                 type: string
 *                 description: Descrição do item
 *                 maxLength: 250
 *                 example: "Pizza clássica italiana com tomate, manjericão e mussarela."
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Preço do item (com duas casas decimais)
 *                 example: 29.99
 *               url:
 *                 type: string
 *                 description: URL da imagem do item
 *                 format: uri
 *                 example: "https://example.com/images/pizza.png"
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID do item criado
 *                   example: 42
 *       400:
 *         description: Dados inválidos na requisição
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro detalhada
 *                   example: "Erro ao criar o item."
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro detalhada
 *                   example: "Não autorizado."
 *       404:
 *         description: Lanchonete ou área de alimentação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro detalhada
 *                   example: "Lanchonete não encontrada."
 */

const maxDecimals = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  const regex = /^\d+\.\d{2}$/;
  return regex.test(value.toString());
};

export const createItemValidation = validation((schema) => ({
  body: yup
    .object()
    .shape({
      name: yup.string().required(),
      desc: yup.string().max("250").required(),
      price: yup
        .number()
        .required()
        .positive()
        .test("maxDecimals", "o preço precisa ter duas casas decimais", maxDecimals),
      url: yup.string().url().required(),
    })
    .noUnknown(true, "chaves adicionais não são permitidas."),
  
}));

const create = async (body) => {
  const { price, name, desc, url, restaurant_id } = body;
  try {
    const [item] = await Knex("menu_item")
      .insert({ restaurant_id, price, name, desc, url })
      .returning("id");
    return item;
  } catch (e) {
    console.log(e);
    throw {
      status: StatusCodes.BAD_REQUEST,
      error: "erro ao criar o item.",
    };
  }
};

const checkRestaurant = async (id, area_id) => Knex("restaurants").where({ id, area_id }).first();

export const createItem = async (req, res) => {
  const { area_id , id} = req.credentials;

  const area = await checkFoodAreaExists(area_id);

  if (area.error) {
    return res.status(area.error.status).json(area);
  }

  const restaurant = await checkRestaurant(id, area_id);

  if (!restaurant) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: "lanchonete não encontrada." });
  }

  if (restaurant.id !== req.credentials.id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "não autorizado." });
  }

  try {
    const response = await create({
      restaurant_id: req.credentials.id,
      ...req.body,
    });
    return res.status(StatusCodes.CREATED).json(response);
  } catch (e) {
    return handleError({ r: res, e });
  }
};

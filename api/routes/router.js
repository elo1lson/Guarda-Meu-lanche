import { Router } from "express";
import { userController, restaurantController } from "../controllers/index.js"
import { checkToken } from '../middlewares/checkToken.js'
const router = Router();

router.post('/users', userController.createValidation, userController.create);
router.delete('/users', userController.create);

router.post('/restaurants', restaurantController.createValidation, restaurantController.create);

//#region restaurants

router.get('/restaurants/:id/items', restaurantController.createQueryValidation, restaurantController.getAllItems);
router.post('/restaurants/:id/items', checkToken('restaurant'), restaurantController.createItemValidation, restaurantController.createItem);
router.patch('/restaurants/:id/items/:item_id', checkToken('restaurant'), restaurantController.updateValidation, restaurantController.update);
router.delete('/restaurants/:id/items/:item_id', checkToken('restaurant'),  restaurantController.deleteItem);

//#endregion

// Nao implementado
// router.get('/orders', );
// router.delete('/orders',);

export { router };
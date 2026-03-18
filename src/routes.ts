import { Router } from "express"
import { deleteMyList, insertMyList, myList, updateMyList } from "./controllers/products-controller"
import { allProducstVerify } from "./controllers/email-controller"



const router = Router()

//----------------------------------------------------------------------------------------------------------- USER ACCOUNT

//------------------------------------------------------------------------------------ GET


router.get("/myList", myList)

router.post("/insertMyList", insertMyList)


router.patch("/updateMyList", updateMyList);

router.delete("/deleteMyList/:id", deleteMyList);


router.get("/allProductsEmail", allProducstVerify)




export default router
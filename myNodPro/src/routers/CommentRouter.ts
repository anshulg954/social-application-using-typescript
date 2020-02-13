import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { PostValidators } from "../validators/PostValidators";
import { PostController } from "../controllers/PostController";
import { CommentValidator } from "../validators/CommentValidators";
import { CommentController } from "../controllers/CommentController";

class CommentRouter{
    public router:Router;

    constructor(){
        this.router=Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }
    getRoutes(){

    }
    postRoutes(){
        this.router.post('/add/:id',GlobalMiddleWare.authenticate,CommentValidator.addComment(),
        GlobalMiddleWare.checkError,CommentController.addComment);
    }
    patchRoutes(){

        this.router.patch('/edit/:id',GlobalMiddleWare.authenticate,CommentValidator.editComment(),GlobalMiddleWare.checkError,CommentController.editComment);

    }
    deleteRoutes(){
        this.router.delete('/delete/:id',GlobalMiddleWare.authenticate,CommentValidator.deleteComment(),GlobalMiddleWare.checkError,CommentController.deleteComment)
    }
}

export default new CommentRouter().router;
import Comment from "../models/Comment"
import Post from "../models/Post";

export class CommentController{


    static async addComment(req,res,next){
        const content=req.body.content;
        const post =req.post;
    try {
        const comment= new Comment({
            content:content,
            created_at:new Date(),
            updated_at:new Date()
        });
        post.comments.push(comment);
       await Promise.all([comment.save(),post.save()])
        res.send(comment);
    } catch (error) {
        next(error);
    }
    }

    static async editComment(req,res,next){

        const content=req.body.content;
        const commentId=req.params.id;
        try {
            const updatedPost=await Comment.findOneAndUpdate(
                {_id:commentId},
                {
                content:content,
                updated_at:new Date(),
                 },
                {
                new:true
                }).populate('comments');
                if(updatedPost){
                    res.send(updatedPost);
                }else{
                    throw new Error('Comment with the given ID does not exist!')
                }

        } catch (error) {
            next(error);
        }
    }

    static async deleteComment(req,res,next){
        const comment=req.comment;
        try {
            comment.remove();
            res.send(comment);

        } catch (error) {
            next(error);
        }

    }

}
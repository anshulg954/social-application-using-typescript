
import Post from "../models/Post";

export class PostController{

    static addPost(req,res,next){
        const userId=req.user.user_id;
        const content=req.body.content;
        const post = new Post({

            user_id:userId,
            content:content,
            created_at:new Date(),
            updated_at:new Date()
        });
        post.save().then(post=>{
            res.send(post);
        }).catch(err=>{
            next(err);
        })
    }

    static async getPostByUser(req,res,next){
        const userId=req.user.user_id;
        const page=parseInt(req.query.page)||1;
        const perPage=2;
        let currentPage=page;
        let prevPage=page===1?null:page-1;
        let pageToken= page+1;
        let totalPages;
        try {
            const postCount=await Post.countDocuments({user_id:userId});
            const totalPages=Math.ceil(postCount/perPage);
            if(totalPages===currentPage||totalPages===0){
                pageToken=null;
            }
            if(page>totalPages){
                throw new Error('No more Posts to show!');
            }
            const posts:any=await Post.find({user_id:userId},{user_id:0,__v:0})
            .populate('comments').skip((perPage*page)-perPage).limit(perPage);
            res.json({
                
                
                post:posts,
                pageToken:pageToken,
                totalPages:totalPages,
                currentPage:currentPage,
                prevPage:prevPage,
                count:posts[0].commentCount
            
            });
            
        }catch (error) {
            next(error);
        }

    }

    static async getAllPosts(req,res,next){
        const userId=req.user.user_id;
        const page=parseInt(req.query.page)||1;
        const perPage=2;
        let currentPage=page;
        let prevPage=page===1?null:page-1;
        let pageToken= page+1;
        let totalPages;

        try {
            const postCount=await Post.estimatedDocumentCount({});
            const totalPages=Math.ceil(postCount/perPage);
            if(totalPages===currentPage||totalPages===0){
                pageToken=null;
            }
            if(page>totalPages){
                throw new Error('No more Posts to show!');
            }
            const posts:any=await Post.find({},{user_id:0,__v:0})
            .populate('comments').skip((perPage*page)-perPage).limit(perPage);
            
            
            res.json({
                
                
                post:posts,
                pageToken:pageToken,
                totalPages:totalPages,
                currentPage:currentPage,
                prevPage:prevPage,
                count:posts[0].commentCount,
            
            });
            
        }catch (error) {
            next(error);
        }

    }

    static async getPostById(req,res,next){
        res.json({
            post:req.post,
            commentCount:req.post.commentCount
        });
    } 

    static async editPost(req,res,next){

        const content=req.body.content;
        const postId=req.params.id;
        try {
            const updatedPost=await Post.findOneAndUpdate(
                {_id:postId},
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
                    throw new Error('Post with the given ID does not exist!')
                }

        } catch (error) {
            next(error);
        }
    }

    static async deletePost(req,res,next){
        const post=req.post;
        try {
            await post.remove();
            res.send(post);
        } catch (error) {
            next(error);
        }
    }
}
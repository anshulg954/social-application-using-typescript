"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("../models/Post");
class PostController {
    static addPost(req, res, next) {
        const userId = req.user.user_id;
        const content = req.body.content;
        const post = new Post_1.default({
            user_id: userId,
            content: content,
            created_at: new Date(),
            updated_at: new Date()
        });
        post.save().then(post => {
            res.send(post);
        }).catch(err => {
            next(err);
        });
    }
    static getPostByUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.user_id;
            const page = parseInt(req.query.page) || 1;
            const perPage = 2;
            let currentPage = page;
            let prevPage = page === 1 ? null : page - 1;
            let pageToken = page + 1;
            let totalPages;
            try {
                const postCount = yield Post_1.default.countDocuments({ user_id: userId });
                const totalPages = Math.ceil(postCount / perPage);
                if (totalPages === currentPage || totalPages === 0) {
                    pageToken = null;
                }
                if (page > totalPages) {
                    throw new Error('No more Posts to show!');
                }
                const posts = yield Post_1.default.find({ user_id: userId }, { user_id: 0, __v: 0 })
                    .populate('comments').skip((perPage * page) - perPage).limit(perPage);
                res.json({
                    post: posts,
                    pageToken: pageToken,
                    totalPages: totalPages,
                    currentPage: currentPage,
                    prevPage: prevPage,
                    count: posts[0].commentCount
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllPosts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.user_id;
            const page = parseInt(req.query.page) || 1;
            const perPage = 2;
            let currentPage = page;
            let prevPage = page === 1 ? null : page - 1;
            let pageToken = page + 1;
            let totalPages;
            try {
                const postCount = yield Post_1.default.estimatedDocumentCount({});
                const totalPages = Math.ceil(postCount / perPage);
                if (totalPages === currentPage || totalPages === 0) {
                    pageToken = null;
                }
                if (page > totalPages) {
                    throw new Error('No more Posts to show!');
                }
                const posts = yield Post_1.default.find({}, { user_id: 0, __v: 0 })
                    .populate('comments').skip((perPage * page) - perPage).limit(perPage);
                res.json({
                    post: posts,
                    pageToken: pageToken,
                    totalPages: totalPages,
                    currentPage: currentPage,
                    prevPage: prevPage,
                    count: posts[0].commentCount,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getPostById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.json({
                post: req.post,
                commentCount: req.post.commentCount
            });
        });
    }
    static editPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = req.body.content;
            const postId = req.params.id;
            try {
                const updatedPost = yield Post_1.default.findOneAndUpdate({ _id: postId }, {
                    content: content,
                    updated_at: new Date(),
                }, {
                    new: true
                }).populate('comments');
                if (updatedPost) {
                    res.send(updatedPost);
                }
                else {
                    throw new Error('Post with the given ID does not exist!');
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deletePost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = req.post;
            try {
                yield post.remove();
                res.send(post);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.PostController = PostController;

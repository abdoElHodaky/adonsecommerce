"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
// Category routes
const CategoryController = () => Promise.resolve().then(() => require('#controllers/category_controller'));
router_1.default
    .group(() => {
    // List all categories
    router_1.default.get('/', [CategoryController, 'index']);
    // Show category with products
    router_1.default.get('/:slug', [CategoryController, 'show']);
})
    .prefix('/store/categories');

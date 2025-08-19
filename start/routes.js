import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'
import { Edge } from "edge.js"
import { join } from 'node:path'

import  "./routes/store.js";
import "./routes/auth.js"
import "./routes/product.js"
import "./routes/merchant.js"
import "./routes/category.js"

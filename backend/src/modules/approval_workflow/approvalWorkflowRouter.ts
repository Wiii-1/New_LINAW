import { Router } from "express"
import { EventBus } from "../../shared/events/eventBus.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { checkRateLimit } from "../../shared/middleware/rateLimit/rate-limiter.js"

const router = Router()

router.use(authenticate)
router.use(checkRateLimit)


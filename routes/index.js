const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const adminRouter = require('./adminRouter')
const catalogRouter = require('./catalogRouter')

router.use('/user', userRouter)
router.use('/catalog', catalogRouter)
router.use('/admin', adminRouter)

module.exports = router
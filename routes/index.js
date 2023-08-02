import express from 'express'
import applicationsRouter from './applications.route.js'
import requestsRouter from './requests.route.js'

const router = express.Router()

const defaultRoutes = [
    {
        path: '/applications',
        route: applicationsRouter
    },
    {
        path: '/requests',
        route: requestsRouter
    }
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router
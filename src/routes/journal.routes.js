import { journalHandlers } from '../controllers/journal.controller.js'
import { slugRouter } from './_slugRouter.js'

export default slugRouter(journalHandlers)

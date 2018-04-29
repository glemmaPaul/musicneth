import fileHandler from './upload/files'
import authHandler from './auth'

/**
 * Attaches handlers for event loops
 * @param  {config} opts
 */
export default function(opts) {
  fileHandler(opts)
  authHandler(opts)
}

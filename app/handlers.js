import torrentHandler from './torrent'
import authHandler from './auth'

/**
 * Attaches handlers for event loops
 * @param  {config} opts
 */
export default function(opts) {
  torrentHandler(opts)
  authHandler(opts)
}

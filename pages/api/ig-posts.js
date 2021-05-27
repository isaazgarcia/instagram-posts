import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'
import { getInstagramPosts } from '../../utils/utils'

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET and OPTIONS
    methods: ['GET', 'OPTIONS'],
    credentials: true,
  }),
)

export default async (req, res) => {
  await cors(req, res)
  const { username } = req.query

  if(!username){
    res.status(400).json('Invalid Username')
    return
  }
  const results = await getInstagramPosts(username)
  if (!!results.error) {
    res.status(400).json(results)
  } else {
    res.status(200).json(results)
  }

}
const axios = require('axios')
const cacheData = require('memory-cache')
const exampleData = require('../data/example-data.json')

export function getInstagramApiUrl (username) {
  return `https://www.instagram.com/${username}/?__a=1`
}

export async function getInstagramPosts (username) {
  const url = process.env.ENV === 'prod'? getInstagramApiUrl(username) : process.env.BASE_URL + '/example-data.json'
  const value = cacheData.get(url)
  const cacheHours = process.env.CACHE_HOURS

  if (value) {
    console.log('Returning cache data')
    return value
  } else {
    try {
      // const { data } = await axios.get(url)
      let data
      if (['test'].includes(process.env.ENV)){
        data = exampleData
      }else{
        data = (await axios.get(url)).data
      }
      console.log({ url })
      console.log(data)
      const posts = data.graphql.user.edge_owner_to_timeline_media.edges.map(post => (
        {
          id: post.node.id,
          url: `https://www.instagram.com/p/${post.node.shortcode}/`,
          is_video: post.node.is_video,
          edge_liked_by_count: post.node.edge_liked_by.count,
          display_url: post.node.display_url,
          thumbnail_src: post.node.thumbnail_src,
          caption: post.node.edge_media_to_caption.edges[0].node.text,
        }
      ))

      const profile = {
        username,
        full_name: data.graphql.user.full_name,
        biography: data.graphql.user.biography,
        followed_by_count: data.graphql.user.edge_followed_by.count,
        posts,
      }

      cacheData.put(url, profile, cacheHours * 1000 * 60 * 60)
      console.log('Returning fresh data')
      return profile
    } catch (error) {
      console.log({ error })
      return ({ error })
    }
  }
}
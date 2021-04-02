import React from 'react'

const Post = ({ params = {} }) => {
  return (
    <div>
      <h1>Post #{params.postId}</h1>
    </div>
  )
}

export default Post

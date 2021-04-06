import React from 'react'

const Post = ({ params = {}, isLoadingProps, isRevalidatingProps }) => {
  if (!import.meta.env.SSR) {
    console.log({ isLoadingProps, isRevalidatingProps })
  }

  return (
    <div>
      <h1>Post #{params.postId}</h1>
    </div>
  )
}

export default Post

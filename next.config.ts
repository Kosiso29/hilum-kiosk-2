import withPWA from 'next-pwa'

const config = {
  reactStrictMode: true,
}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})(config)

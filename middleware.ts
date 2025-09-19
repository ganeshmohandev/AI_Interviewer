import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

//const isPublicRoute = createRouteMatcher(['/sign-in(.*)','/sign-up(.*)','/'])

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/interview/:id/start',
  '/api/akool-knowledge-base(.*)',
  '/api/akool-session(.*)',
  '/api/interview-feedback(.*)',
  '/api/convex(.*)',
  '/api/upload-interview-video(.*)',
])



export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
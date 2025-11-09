// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // This line passes the cookie to the next server component/middleware
          request.cookies.set({ name, value, ...options })
          // This line sends the cookie back to the browser
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // This line removes the cookie from the server context
          request.cookies.set({ name, value: '', ...options })
          // This line tells the browser to delete the cookie
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- 1. Get Role and Sites from Metadata (that you saved at login) ---
  const role = user?.user_metadata?.role || null
  const sites = (user?.user_metadata?.sites as string[]) || []

  // --- 2. Protect Admin Routes ---
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // Not logged in, send to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== 'admin') {
      // Logged in, but NOT an admin. Send to home page.
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Is an admin, let them pass
    return response
  }

  // --- 3. Protect Client Routes ---
  if (pathname.startsWith('/tools')) {
    if (!user) {
      // Not logged in, send to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If they are an admin, let them see any client page
    if (role === 'admin') {
      return response
    }

    // If they are a client, check they have access to *this specific site*
    if (role === 'client') {
      const clientSiteFromUrl = pathname.split('/')[2]
      if (sites.includes(clientSiteFromUrl)) {
        // They have access, let them pass
        return response
      } else {
        // Not their site! Send to home page.
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Default: allow the request
  return response
}

// --- 5. Define which routes the middleware runs on ---
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // We can be more specific to just the routes we care about:
    // '/admin/:path*',
    // '/tools/:path*',
    // '/login',
  ],
}
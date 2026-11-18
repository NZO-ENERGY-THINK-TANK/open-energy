import type { ComponentProps } from 'react'
import { Link as RouterLink } from '@tanstack/react-router'

const routes = [
  '/', '/about', '/contact', '/api', '/api-docs', '/terms',
  '/renewable-energy', '/predictions', '/climate', '/emissions',
] as const

type LinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string; replace?: boolean }

/** Preserve source hrefs while routing application pages through TanStack Router. */
export default function Link({ href, replace, ...props }: LinkProps) {
  if (!href.startsWith('/') || href.startsWith('//') || props.download || props.target === '_blank') {
    return <a {...props} href={href} />
  }
  const url = new URL(href, 'https://open-energy.invalid')
  const route = routes.find((route) => route === url.pathname)
  if (!route) return <a {...props} href={href} />
  const search: Record<string, string> = {}
  url.searchParams.forEach((value, key) => { search[key] = value })
  return <RouterLink {...props} to={route} search={search} hash={url.hash.slice(1)} replace={replace} />
}

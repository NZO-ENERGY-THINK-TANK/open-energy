import type { ComponentProps } from 'react'

/** Native image rendering for migrated UI; Vite supplies asset URLs. */
type ImageProps = Omit<ComponentProps<'img'>, 'src'> & {
  src: string | { src: string }
  fill?: boolean
  priority?: boolean
}

export default function Image({
  src,
  fill,
  priority,
  style,
  loading,
  ...props
}: ImageProps) {
  return (
    <img
      {...props}
      src={typeof src === 'string' ? src : src.src}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : props.fetchPriority}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              ...style,
            }
          : style
      }
    />
  )
}

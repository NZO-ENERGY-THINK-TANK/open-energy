import { useState } from 'react'

export function useChartLegend() {
  const [hidden, setHidden] = useState<string[]>([])
  const [hovered, onHover] = useState<string | null>(null)
  return {
    hidden,
    hovered,
    onHover,
    onToggle: (key: string) =>
      setHidden((current) =>
        current.includes(key)
          ? current.filter((item) => item !== key)
          : [...current, key],
      ),
  }
}

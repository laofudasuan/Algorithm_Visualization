import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VisualizationsIndex = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const modsJsx = import.meta.glob('/src/pages/visualization/*.jsx')
    const modsJdx = import.meta.glob('/src/pages/visualization/*.jdx')
    const modules = { ...modsJsx, ...modsJdx }
    const keys = Object.keys(modules)
    ;(async () => {
      const list = []
      for (const path of keys) {
        try {
          const mod = await modules[path]()
          const comp = mod.default
          const file = path.split('/').pop()
          const slug = file.replace(/\.(jsx|jdx)$/i, '')
          const title = comp?.title || mod.title || slug
          const description = comp?.description || mod.description || ''
          list.push({ slug, title, description })
        } catch {
          const file = path.split('/').pop()
          const slug = file.replace(/\.(jsx|jdx)$/i, '')
          list.push({ slug, title: slug, description: '' })
        }
      }
      setItems(list)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">可视化模块</h1>
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md">
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.slug} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="pr-4">
                    <div className="text-lg font-semibold">{it.title}</div>
                    {it.description && (
                      <div className="text-sm text-gray-600 mt-1">{it.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/visualizations/${it.slug}`)}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    打开
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualizationsIndex


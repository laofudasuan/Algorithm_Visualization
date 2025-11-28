import React, { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

const VisualizationsDetail = () => {
  const { slug } = useParams()

  const modules = useMemo(() => ({
    ...import.meta.glob('/src/pages/visualization/*.jsx'),
    ...import.meta.glob('/src/pages/visualization/*.jdx')
  }), [])

  const matchPath = useMemo(() => {
    const keys = Object.keys(modules)
    return keys.find((p) => p.endsWith(`/${slug}.jsx`) || p.endsWith(`/${slug}.jdx`))
  }, [modules, slug])

  if (!matchPath) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-gray-600">未找到可视化：{slug}</p>
          </div>
        </div>
      </div>
    )
  }

  const LazyPage = React.lazy(modules[matchPath])

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        }>
          <LazyPage />
        </Suspense>
      </div>
    </div>
  )
}

export default VisualizationsDetail


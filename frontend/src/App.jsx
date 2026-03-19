import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './hooks/useAuth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Forum from './pages/Forum'
import ForumPost from './pages/ForumPost'
import About from './pages/About'
import Cabinet from './pages/Cabinet'
import Rules from './pages/Rules'
import News from './pages/News'

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index            element={<Home />} />
        <Route path="forum"     element={<Forum />} />
        <Route path="forum/:id" element={<ForumPost />} />
        <Route path="about"     element={<About />} />
        <Route path="cabinet"   element={<Cabinet />} />
        <Route path="rules"     element={<Rules />} />
        <Route path="news"      element={<News />} />
      </Route>
    </Routes>
  )
}

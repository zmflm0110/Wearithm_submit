import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import ProfileEditPage from './pages/ProfileEditPage'
import { getUser } from './api'

const App = () => {
  const [user, setUser] = useState(getUser());

  return (
    <Routes>
      <Route element={<Layout user={user} setUser={setUser} />}>
        <Route path="/" element={<Home />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/write" element={<ItemFormPage />} />
        <Route path="/items/:id/edit" element={<ItemFormPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<ProfileEditPage />} />
      </Route>
    </Routes>
  )
}

export default App

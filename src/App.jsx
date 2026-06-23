import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import CourseOverview from './pages/CourseOverview.jsx';
import LessonPlayer from './pages/LessonPlayer.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseOverview />} />
          <Route
            path="courses/:courseId/lessons/:lessonId"
            element={<LessonPlayer />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

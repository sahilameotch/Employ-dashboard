import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import { AddEmployeePage, EditEmployeePage } from '@/pages/EmployeeFormPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<AddEmployeePage />} />
          <Route path="employees/:id/edit" element={<EditEmployeePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

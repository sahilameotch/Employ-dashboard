import type {
  Employee,
  EmployeeFormData,
  EmployeeListResponse,
  EmployeeSummary,
} from '@/features/employees/types'
import { seedEmployees } from '@/features/employees/mockData'

/**
 * In-memory dummy backend. Used only while USE_DUMMY_API is true.
 * Replace with a real server — keep the same URL shapes in employeesApi.
 */
let employees: Employee[] = structuredClone(seedEmployees)
let nextId = employees.length + 1

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function parseUrl(input: RequestInfo | URL) {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  return new URL(raw, 'http://localhost')
}

function filterEmployees(params: URLSearchParams): Employee[] {
  const search = params.get('search')?.trim().toLowerCase() ?? ''
  const status = params.get('status') ?? 'All'

  return employees.filter((emp) => {
    if (status !== 'All' && emp.status !== status) return false
    if (!search) return true
    const haystack = [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone,
      emp.department,
      emp.designation,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(search)
  })
}

async function readBody<T>(init?: RequestInit): Promise<T | undefined> {
  if (!init?.body) return undefined
  return JSON.parse(String(init.body)) as T
}

/**
 * Drop-in `fetch` replacement that serves dummy REST endpoints.
 * When moving to production, remove `fetchFn: dummyFetch` from baseApi
 * and point `VITE_API_BASE_URL` at the real API.
 */
export async function dummyFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  await delay()
  const url = parseUrl(input)
  const method = (init?.method ?? 'GET').toUpperCase()
  const path = url.pathname.replace(/\/+$/, '') || '/'

  // GET /employees/summary
  if (method === 'GET' && path === '/employees/summary') {
    const summary: EmployeeSummary = {
      total: employees.length,
      active: employees.filter((e) => e.status === 'Active').length,
      inactive: employees.filter((e) => e.status === 'Inactive').length,
    }
    return jsonResponse(summary)
  }

  // GET /employees/:id
  const byId = path.match(/^\/employees\/([^/]+)$/)
  if (method === 'GET' && byId) {
    const employee = employees.find((e) => e.id === byId[1])
    if (!employee) return jsonResponse({ message: 'Employee not found' }, 404)
    return jsonResponse(employee)
  }

  // GET /employees?search=&page=&pageSize=&status=
  if (method === 'GET' && path === '/employees') {
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 8)
    const filtered = filterEmployees(url.searchParams)
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    const payload: EmployeeListResponse = {
      data: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    }
    return jsonResponse(payload)
  }

  // POST /employees
  if (method === 'POST' && path === '/employees') {
    const body = await readBody<EmployeeFormData>(init)
    if (!body) return jsonResponse({ message: 'Invalid body' }, 400)

    const exists = employees.some(
      (e) =>
        e.employeeCode.toLowerCase() === body.employeeCode.toLowerCase() ||
        e.email.toLowerCase() === body.email.toLowerCase(),
    )
    if (exists) {
      return jsonResponse({ message: 'Employee code or email already exists' }, 400)
    }

    const employee: Employee = { ...body, id: String(nextId++) }
    employees = [employee, ...employees]
    return jsonResponse(employee, 201)
  }

  // PUT /employees/:id
  if (method === 'PUT' && byId) {
    const body = await readBody<EmployeeFormData>(init)
    if (!body) return jsonResponse({ message: 'Invalid body' }, 400)

    const index = employees.findIndex((e) => e.id === byId[1])
    if (index === -1) return jsonResponse({ message: 'Employee not found' }, 404)

    const duplicate = employees.some(
      (e) =>
        e.id !== byId[1] &&
        (e.employeeCode.toLowerCase() === body.employeeCode.toLowerCase() ||
          e.email.toLowerCase() === body.email.toLowerCase()),
    )
    if (duplicate) {
      return jsonResponse({ message: 'Employee code or email already exists' }, 400)
    }

    const updated: Employee = { ...body, id: byId[1] }
    employees = [...employees.slice(0, index), updated, ...employees.slice(index + 1)]
    return jsonResponse(updated)
  }

  // DELETE /employees/:id
  if (method === 'DELETE' && byId) {
    const exists = employees.some((e) => e.id === byId[1])
    if (!exists) return jsonResponse({ message: 'Employee not found' }, 404)
    employees = employees.filter((e) => e.id !== byId[1])
    return jsonResponse({ id: byId[1] })
  }

  return jsonResponse({ message: `No dummy handler for ${method} ${path}` }, 404)
}

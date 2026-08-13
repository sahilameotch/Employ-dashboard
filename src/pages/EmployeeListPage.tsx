import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Employee, EmployeeStatus } from "@/features/employees/types";
import {
  filterStaticEmployees,
  paginateStaticEmployees,
  staticEmployees,
} from "@/features/employees/staticData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 8;

export function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>(staticEmployees);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);

  const data = useMemo(() => {
    const filtered = filterStaticEmployees(employees, { search, status });
    return paginateStaticEmployees(filtered, page, PAGE_SIZE);
  }, [employees, search, status, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    setEmployees((prev) => prev.filter((e) => e.id !== pendingDelete.id));
    toast.success(
      `${pendingDelete.firstName} ${pendingDelete.lastName} deleted`,
    );
    setPendingDelete(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Employee directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, edit, or remove employee records.
          </p>
        </div>
        <Button asChild>
          <Link to="/employees/new">
            <Plus />
            Add Employee
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Find employees by name, code, department, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_160px_auto]"
          >
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-8"
                  placeholder="Name, code, email, department..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as EmployeeStatus | "All");
                  setPage(1);
                }}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {data.data.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="font-medium">No employees found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search or add a new employee.
              </p>
              <Button asChild>
                <Link to="/employees/new">Add Employee</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Designation
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium text-primary">
                        {emp.employeeCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {emp.department}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {emp.designation}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            emp.status === "Active" ? "success" : "secondary"
                          }
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon">
                            <Link
                              to={`/employees/${emp.id}/edit`}
                              aria-label="Edit"
                            >
                              <Pencil />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(emp)}
                            aria-label="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {(data.page - 1) * data.pageSize + 1}–
                  {Math.min(data.page * data.pageSize, data.total)} of{" "}
                  {data.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {data.page} / {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `This will permanently remove ${pendingDelete.firstName} ${pendingDelete.lastName} (${pendingDelete.employeeCode}).`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

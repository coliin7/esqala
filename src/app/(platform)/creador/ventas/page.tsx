"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

interface OrderRow {
  id: string
  status: string
  amount_ars: number
  platform_fee_ars: number | null
  creator_earning_ars: number | null
  installments: number | null
  created_at: string
  course: { id: string; title: string }
  student: { display_name: string; email: string }
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reembolsado",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending: "secondary",
  processing: "secondary",
  rejected: "destructive",
  refunded: "destructive",
}

export default function VentasPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [ordersRes, coursesRes] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          *,
          course:courses!inner(id, title, creator_id),
          student:profiles!orders_student_id_fkey(display_name, email)
        `)
        .eq("course.creator_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("courses")
        .select("id, title")
        .eq("creator_id", user.id),
    ])

    setOrders((ordersRes.data as unknown as OrderRow[]) || [])
    setCourses(coursesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterCourse !== "all" && order.course?.id !== filterCourse) return false
      if (filterStatus !== "all" && order.status !== filterStatus) return false
      if (filterDateFrom && new Date(order.created_at) < new Date(filterDateFrom)) return false
      if (filterDateTo) {
        const to = new Date(filterDateTo)
        to.setDate(to.getDate() + 1)
        if (new Date(order.created_at) > to) return false
      }
      return true
    })
  }, [orders, filterCourse, filterStatus, filterDateFrom, filterDateTo])

  const approvedOrders = useMemo(() => filteredOrders.filter((o) => o.status === "approved"), [filteredOrders])

  const totalRevenue = approvedOrders.reduce((sum, o) => sum + Number(o.amount_ars), 0)
  const totalFees = approvedOrders.reduce((sum, o) => sum + Number(o.platform_fee_ars || 0), 0)
  const totalNet = totalRevenue - totalFees

  // This month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthOrders = approvedOrders.filter((o) => new Date(o.created_at) >= monthStart)
  const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.amount_ars), 0)

  if (loading) return <div className="text-muted-foreground">Cargando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ventas</h1>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos netos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalNet.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Bruto: ${totalRevenue.toLocaleString("es-AR")} | Comisión: ${totalFees.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas este mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthRevenue.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthOrders.length} ventas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total ventas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Ticket promedio: $
              {approvedOrders.length > 0
                ? Math.round(totalRevenue / approvedOrders.length).toLocaleString("es-AR")
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Curso</Label>
              <select
                className="w-full h-8 rounded-md border bg-background px-2 text-sm"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="all">Todos</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <select
                className="w-full h-8 rounded-md border bg-background px-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="approved">Aprobado</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="rejected">Rechazado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                className="h-8"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                className="h-8"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historial de ventas
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredOrders.length} resultados)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay ventas con estos filtros
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Neto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[180px] truncate">
                        {order.course?.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.student?.email}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        ${Number(order.amount_ars).toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.installments || "-"}
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">
                        ${Number(order.creator_earning_ars || 0).toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[order.status] || "secondary"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

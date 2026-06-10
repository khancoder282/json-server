import { auth } from "@/auth"
import { getUserById } from "@/lib/data/users"
import { getJsonStoresByUser } from "@/lib/data/json-stores"
import { getApiKeysByUser } from "@/lib/data/api-keys"
import { countLogsByUser } from "@/lib/data/logs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [user, stores, keys, logCount] = await Promise.all([
    getUserById(userId),
    getJsonStoresByUser(userId),
    getApiKeysByUser(userId),
    countLogsByUser(userId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Row label="Name" value={user?.name ?? ""} />
          <Row label="Email" value={
            <span className="flex items-center gap-2">
              {user?.email}
              {user?.emailVerified
                ? <Badge variant="secondary" className="text-xs">Verified</Badge>
                : <Badge variant="destructive" className="text-xs">Unverified</Badge>}
            </span>
          } />
          <Row label="Joined" value={user?.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) ?? ""} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="JSON Stores" value={stores.length} />
        <StatCard title="API Keys" value={keys.length} />
        <StatCard title="Total API Calls" value={logCount} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}

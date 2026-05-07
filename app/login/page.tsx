'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Leaf, ArrowLeft, User, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { login } from '@/lib/api'
import { cn } from '@/lib/utils'

type Role = 'manager' | 'employee'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('manager')
  const [username, setUsername] = useState('manager@briket.co')
  const [password, setPassword] = useState('briket2026')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Please enter username and password')
      return
    }

    setIsLoading(true)
    try {
      const result = await login(username, password)
      if (result.success) {
        toast.success(`Login successful — ${result.nama}`)
        // Store auth info in sessionStorage
        sessionStorage.setItem('auth', JSON.stringify({
          nama: result.nama,
          role: result.role,
          token: result.token
        }))
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    if (newRole === 'manager') {
      setUsername('manager@briket.co')
    } else {
      setUsername('employee@briket.co')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-border/50">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-extrabold text-primary">BricketChain</h2>
              <p className="text-[11px] text-muted-foreground mt-1">Ops Control Tower — Restricted Access</p>
            </div>

            {/* Role Selection */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Login As:
            </p>
            <div className="flex gap-2 mb-5">
              <RoleButton
                icon={<Briefcase className="w-4 h-4" />}
                label="Manager"
                active={role === 'manager'}
                onClick={() => handleRoleChange('manager')}
              />
              <RoleButton
                icon={<User className="w-4 h-4" />}
                label="Employee"
                active={role === 'employee'}
                onClick={() => handleRoleChange('employee')}
              />
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide">
                  Username
                </Label>
                <Input
                  type="email"
                  placeholder="manager@briket.co"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full mt-1 shadow-md"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Login'}
              </Button>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <p className="text-center text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors font-medium">
                Forgot Password?
              </p>
              <p className="text-center text-xs text-muted-foreground font-medium">
                Don't have an account?{' '}
                <span 
                  onClick={() => router.push('/register')}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Register Now
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-4 w-full font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Portal
        </button>
      </div>
    </div>
  )
}

function RoleButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all",
        active
          ? "border-primary bg-secondary text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

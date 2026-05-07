'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Leaf, ArrowLeft, User, Briefcase, Mail, Lock, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { register } from '@/lib/api'
import { cn } from '@/lib/utils'

type Role = 'manager' | 'employee'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('employee')
  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!nama || !username || !password) {
      toast.error('Lengkapi semua data')
      return
    }

    setIsLoading(true)
    try {
      const result = await register(nama, username, password, role)
      if (result.success) {
        toast.success(result.message)
        setTimeout(() => router.push('/login'), 1500)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setIsLoading(false)
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
              <p className="text-[11px] text-muted-foreground mt-1">Daftar Akun Baru</p>
            </div>

            {/* Role Selection */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Daftar Sebagai:
            </p>
            <div className="flex gap-2 mb-5">
              <RoleButton
                icon={<Briefcase className="w-4 h-4" />}
                label="Manager"
                active={role === 'manager'}
                onClick={() => setRole('manager')}
              />
              <RoleButton
                icon={<User className="w-4 h-4" />}
                label="Employee"
                active={role === 'employee'}
                onClick={() => setRole('employee')}
              />
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="pl-10"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide">
                  Username (Email)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@briket.co"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  />
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full mt-1 shadow-md"
                size="lg"
              >
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </div>

            <p 
              className="text-center text-xs text-muted-foreground mt-6 font-medium"
            >
              Sudah punya akun? {' '}
              <span 
                onClick={() => router.push('/login')}
                className="text-primary hover:underline cursor-pointer"
              >
                Masuk di sini
              </span>
            </p>
          </CardContent>
        </Card>

        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-4 w-full font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Portal Publik
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

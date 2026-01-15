import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { Lock, Mail } from 'lucide-react'

export const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                toast.success('¡Cuenta creada! Por favor verifica tu email.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast.success('Bienvenido de nuevo')
                navigate('/')
            }
        } catch (error: any) {
            toast.error(error.message || 'Error en la autenticación')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                            Strimo
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            {isSignUp ? 'Crea tu cuenta para empezar' : 'Ingresa para gestionar tus suscripciones'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-slate-900/50 border-white/5 focus:border-indigo-500/50"
                                    required
                                    label=""
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-slate-900/50 border-white/5 focus:border-indigo-500/50"
                                    required
                                    label=""
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 mt-6"
                        >
                            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isSignUp
                                ? '¿Ya tienes cuenta? Inicia sesión'
                                : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

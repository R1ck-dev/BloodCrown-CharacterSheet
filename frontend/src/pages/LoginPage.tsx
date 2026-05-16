/**
 * Login — AuthCard + RHF + Zod + useLogin mutation.
 * Redireciona pra /dashboard ao sucesso. Erro vira toast Sonner.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/api/auth';
import { ApiError } from '@/api/client';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Informe seu nome de usuario.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? 'Usuario ou senha incorretos.'
          : err instanceof Error
            ? err.message
            : 'Falha no login. Tente novamente.';
      toast.error(message);
    }
  });

  const busy = isSubmitting || login.isPending;

  return (
    <AuthCard
      dividerGlyph="✶  Acesso  ✶"
      footer={
        <span style={{ color: 'var(--bc-ink-dim)', fontSize: 13 }}>
          Nao tem uma conta?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--bc-gold)',
              fontWeight: 500,
              borderBottom: '1px dotted rgba(212, 175, 55, 0.4)',
            }}
          >
            Criar agora
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 22 }}>
        <Field
          label="Usuario"
          iconLeft={<User size={16} />}
          placeholder="seu_nome"
          autoComplete="username"
          autoFocus
          {...register('username')}
          error={errors.username?.message}
        />

        <Field
          label="Senha"
          type={showPwd ? 'text' : 'password'}
          iconLeft={<Lock size={16} />}
          iconRight={
            <button
              type="button"
              className="bc-input-icon bc-input-icon--right bc-input-icon--clickable"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" block loading={busy} style={{ marginTop: 10 }}>
          <Crown size={14} />
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
}

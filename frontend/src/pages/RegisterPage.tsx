/**
 * Register — AuthCard + RHF + Zod + useRegister mutation.
 * Apos sucesso: toast verde + redireciona pro Login com mensagem.
 * Constraints batem com backend RegisterDTO (username 3-50, password min 6).
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
import { useRegister } from '@/api/auth';
import { ApiError } from '@/api/client';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Usuario deve ter ao menos 3 caracteres.')
      .max(50, 'Usuario deve ter no maximo 50 caracteres.'),
    password: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres.')
      .max(100, 'Senha deve ter no maximo 100 caracteres.'),
    confirm: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'As senhas nao coincidem.',
    path: ['confirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async ({ username, password }) => {
    try {
      await registerMutation.mutateAsync({ username, password });
      toast.success('Conta criada! Faca login pra entrar na aventura.');
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 409
            ? 'Esse nome de usuario ja esta em uso.'
            : 'Falha no registro. Verifique os dados.'
          : err instanceof Error
            ? err.message
            : 'Erro inesperado ao criar conta.';
      toast.error(message);
    }
  });

  const busy = isSubmitting || registerMutation.isPending;

  return (
    <AuthCard
      dividerGlyph="✶  Iniciacao  ✶"
      title="Criar Conta"
      subtitle="Junte-se a aventura"
      footer={
        <span style={{ color: 'var(--bc-ink-dim)', fontSize: 13 }}>
          Ja tem uma conta?{' '}
          <Link
            to="/"
            style={{
              color: 'var(--bc-gold)',
              fontWeight: 500,
              borderBottom: '1px dotted rgba(212, 175, 55, 0.4)',
            }}
          >
            Fazer Login
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
          hint={!errors.password ? 'Pelo menos 6 caracteres.' : undefined}
        />

        <Field
          label="Confirmar senha"
          type={showConfirm ? 'text' : 'password'}
          iconLeft={<Lock size={16} />}
          iconRight={
            <button
              type="button"
              className="bc-input-icon bc-input-icon--right bc-input-icon--clickable"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirm')}
          error={errors.confirm?.message}
        />

        <Button type="submit" block loading={busy} style={{ marginTop: 8 }}>
          <Crown size={14} />
          Registrar
        </Button>
      </form>
    </AuthCard>
  );
}

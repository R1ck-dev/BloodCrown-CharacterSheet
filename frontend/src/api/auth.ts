import { useMutation } from '@tanstack/react-query';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from '@/types/auth';
import { request, tokenStorage } from './client';

async function loginRequest(creds: LoginCredentials): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: creds,
    auth: false,
  });
}

async function registerRequest(creds: RegisterCredentials): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: creds,
    auth: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      tokenStorage.set(data.token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}

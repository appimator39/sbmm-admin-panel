import { useState } from 'react';
import { useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useLogin } from 'src/hooks/use-login';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    try {
      const loginData = {
        ...data,
        hardwareId: 'sbmm-dashboard-123',
        deviceType: 'MACOS',
      };
      await login(loginData);
      router.push('/');
    } catch (err: any) {
      // Error is handled in useLogin hook
    }
  };

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome to SBMM Dashboard
        </Typography>
      </Box>

      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ width: '100%' }}
      >
        <TextField
          fullWidth
          label="Email address"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Email is invalid',
            },
          })}
          error={!!errors.email || !!error}
          helperText={errors.email?.message as string | undefined}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message:
                'Password must be at least 8 characters including number and uppercase letters',
            },
            validate: (value) => {
              // Check if the password contains at least one number, one lowercase letter, and one uppercase letter
              const hasNumber = /\d/.test(value);
              const hasLowercase = /[a-z]/.test(value);
              const hasUppercase = /[A-Z]/.test(value);

              if (!hasNumber || !hasLowercase || !hasUppercase) {
                return 'Password must be at least 8 characters including number and uppercase letters';
              }

              return true; // Validation passes
            },
          })}
          error={!!errors.password || !!error}
          helperText={typeof errors.password?.message === 'string' ? errors.password?.message : ''}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2, alignSelf: 'flex-start' }}>
            {error}
          </Typography>
        )}

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          loading={loading}
          disabled={!isValid || loading}
        >
          Sign in
        </LoadingButton>
      </Box>
    </>
  );
}

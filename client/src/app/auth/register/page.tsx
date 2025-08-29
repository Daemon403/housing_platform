'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['student', 'homeowner'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Registration data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-center">Create a new account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`input-field ${errors.confirmPassword ? 'border-red-300' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative border rounded-lg p-4 flex flex-col items-center cursor-pointer ${
                  watch('role') === 'student' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    className="sr-only"
                    value="student"
                    {...register('role')}
                  />
                  <div className="text-lg">🎓</div>
                  <span className="mt-2 font-medium">Student</span>
                  <span className="text-sm text-gray-500">Looking for housing</span>
                </label>
                
                <label className={`relative border rounded-lg p-4 flex flex-col items-center cursor-pointer ${
                  watch('role') === 'homeowner' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    className="sr-only"
                    value="homeowner"
                    {...register('role')}
                  />
                  <div className="text-lg">🏠</div>
                  <span className="mt-2 font-medium">Homeowner</span>
                  <span className="text-sm text-gray-500">Renting out property</span>
                </label>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-2 px-4"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

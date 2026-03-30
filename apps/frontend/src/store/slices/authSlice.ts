import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthUser } from '../../api/auth'
import {
  signin as signinApi,
  signup as signupApi,
  getAuthUser,
  getAuthToken,
  setAuthToken,
  setAuthUser,
  clearAuth,
} from '../../api/auth'
import type { SignUpBody } from '../../api/auth'

function getInitialAuth(): { user: AuthUser | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null }
  return { user: getAuthUser(), token: getAuthToken() }
}

export const signIn = createAsyncThunk<
  { user: AuthUser; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/signIn', async (body, { rejectWithValue }) => {
  try {
    const res = await signinApi(body)
    if (!res.success || !res.token || !res.user) {
      return rejectWithValue(res.error ?? 'Sign in failed.')
    }
    setAuthToken(res.token)
    setAuthUser(res.user)
    return { user: res.user, token: res.token }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sign in failed.'
    return rejectWithValue(msg)
  }
})

export const signUp = createAsyncThunk<
  { user: AuthUser; token: string },
  SignUpBody,
  { rejectValue: string }
>('auth/signUp', async (body, { rejectWithValue }) => {
  try {
    const res = await signupApi(body)
    if (!res.success || !res.token || !res.user) {
      const message = res.error ?? (res.errors?.length ? res.errors.join('. ') : 'Signup failed.')
      return rejectWithValue(message)
    }
    setAuthToken(res.token)
    setAuthUser(res.user)
    return { user: res.user, token: res.token }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signup failed.'
    return rejectWithValue(msg)
  }
})

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  ...getInitialAuth(),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    logout(state) {
      state.user = null
      state.token = null
      state.error = null
      if (typeof window !== 'undefined') clearAuth()
    },
  },
  extraReducers(builder) {
    builder
      // signIn
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Sign in failed.'
      })
      // signUp
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? 'Signup failed.'
      })
  },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer

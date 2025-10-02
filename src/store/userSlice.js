import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userData: null,           // Keep your existing userData
    auth: {                   // Add new auth state
        user_id: null,
        isAuthenticated: false,
        tokens: { 
            access: null,     // Normalized token names
            refresh: null 
        }
    }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Keep your existing reducers
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        },
        
        // Add new flexible auth reducer
        setAuthData: (state, action) => {
            const { 
                user_id, 
                tokens, 
                isAuthenticated 
            } = action.payload;
            
            // Only update fields that are provided
            if (user_id !== undefined) state.auth.user_id = user_id;
            if (tokens !== undefined) state.auth.tokens = tokens;
            if (isAuthenticated !== undefined) state.auth.isAuthenticated = isAuthenticated;
        },
        
        clearAuthData: (state) => {
            state.auth.user_id = null;
            state.auth.tokens = { access: null, refresh: null };
            state.auth.isAuthenticated = false;
        }
    },
});

export const { 
    setUserData, 
    clearUserData, 
    setAuthData,      // NEW
    clearAuthData     // NEW
} = userSlice.actions;

export default userSlice.reducer;
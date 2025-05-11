'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const AuthProvider = ({children, searchParams}) => {
    const queryClient = new QueryClient();
    const router = useRouter();
 
    const storeUserInfo = async(token, user_id) => {
        if(token && user_id) {
            const res = await signIn("credentials", {
                user_id: user_id,
                token: token,
                redirect: false,

            });
            if(res){
                router.push('/')
            }
            console.log(res,'resp');
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const user_id = params.get('user_id');
            
            if(token && user_id) {
                storeUserInfo(token, user_id);
            }
        }
    }, []);

    return (      
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children} 
            </QueryClientProvider>
        </SessionProvider>
    );
};

export default AuthProvider;
'use client'
import { useRouter } from "next/navigation";

// app/not-found.js
export default function NotFound() {



const router = useRouter();
return router.push('/not-found')

}
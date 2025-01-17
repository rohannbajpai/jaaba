import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import BuilderClient from './builder-client'
import { Suspense } from 'react'
import Loading from './loading'

export const dynamic = 'force-dynamic'

export default async function BuilderPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<Loading />}>
      <BuilderClient />
    </Suspense>
  )
}

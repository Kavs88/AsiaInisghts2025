import { redirect } from 'next/navigation'

export default function VendorProfilePage({ params }: { params: { slug: string } }) {
  redirect(`/markets/sellers/${params.slug}`)
}

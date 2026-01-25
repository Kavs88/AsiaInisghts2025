import { redirect } from 'next/navigation'

export default function VendorProfilePage({ params }: { params: { slug: string } }) {
  redirect(`/sellers/${params.slug}`)
}

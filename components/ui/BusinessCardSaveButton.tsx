'use client'

import { SaveButton } from './SoftActionButtons'

export default function BusinessCardSaveButton({ id }: { id: string }) {
  return (
    <SaveButton
      itemType="entity"
      itemId={id}
      minimal
      className="bg-white/90 backdrop-blur-md shadow-md border-transparent hover:bg-white"
    />
  )
}

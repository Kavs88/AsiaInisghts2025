// Supabase Edge Function: Process Vendor Document
// Uses AI (Gemini) to extract metadata from documents (PDFs/Images)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''

interface RequestBody {
  documentId: string
}

serve(async (req) => {
  try {
    const { documentId }: RequestBody = await req.json()

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing documentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Fetch document details from DB
    const { data: document, error: fetchError } = await supabase
      .from('vendor_documents')
      .select('*, document_types(name)')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      throw new Error(`Failed to fetch document: ${fetchError?.message}`)
    }

    // 2. Download file from Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('vendor-documents')
      .download(document.storage_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    // 3. Perform OCR (Placeholder - in a real scenario, use a dedicated OCR service or Gemini Multimodal)
    // For this demonstration, we'll assume we're sending the file to Gemini's multimodal API
    const base64File = btoa(new Uint8Array(await fileData.arrayBuffer()).reduce((data, byte) => data + String.fromCharCode(byte), ''))
    
    // 4. Send to Gemini for Metadata Extraction
    let extractedData = {}
    if (GEMINI_API_KEY) {
      const prompt = `
        Analyze this document (type: ${document.document_types?.name || 'General'}).
        Extract the following information in JSON format:
        - provider_name: The company or organization name.
        - document_date: The date the document was issued.
        - expiry_date: The date this document or contract expires (MUST BE YYYY-MM-DD).
        - reference_number: Any policy number, invoice number, or ID.
        - summary: A 2-sentence summary of the document.
        
        Return ONLY valid JSON.
      `

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: fileData.type, data: base64File } }
            ]
          }]
        })
      })

      if (geminiResponse.ok) {
        const result = await geminiResponse.json()
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0])
        }
      }
    }

    // 5. Update Database with extracted metadata
    const { error: updateError } = await supabase
      .from('vendor_documents')
      .update({
        extracted_metadata: extractedData,
        expiry_date: (extractedData as any).expiry_date || null,
        name: (extractedData as any).provider_name ? `${document.document_types?.name}: ${(extractedData as any).provider_name}` : document.name
      })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Failed to update document metadata: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

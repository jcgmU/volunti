import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth()
        if (!session || !session.user || !session.user.id) {
          throw new Error('Unauthorized')
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
          tokenPayload: JSON.stringify({ userId: session.user.id })
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Here you could update the database with the new avatar URL
        // However, the prompt specifies that the client form will pass the URL via a hidden input to the existing action.
        console.log('Upload completed', blob.url)
      }
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}

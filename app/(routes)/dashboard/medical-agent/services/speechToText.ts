/**
 * Converts audio blob to text using our API endpoint
 */
export async function convertAudioToText(audioBlob: Blob): Promise<string> {
  try {
    console.log("Converting audio to text via API...")

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Transcription failed')
    }

    const { transcript } = await response.json()

    if (!transcript) {
      throw new Error('No transcription result')
    }

    console.log("Transcription completed:", transcript)
    return transcript
  } catch (error) {
    console.error("Error converting audio to text:", error)
    throw error
  }
}


async function pollForTranscript(transcriptId: string, apiKey: string): Promise<string> {
  let status = "processing"
  let transcript = ""

  while (status === "processing" || status === "queued") {
    console.log("Polling for transcript results...")

    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        "Authorization": apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`AssemblyAI API error: ${response.status}`)
    }

    const data = await response.json()
    status = data.status

    if (status === "completed") {
      transcript = data.text
    } else if (status === "error") {
      throw new Error(`Transcription error: ${data.error}`)
    }
  }

  return transcript
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
  
        const base64 = reader.result.split(",")[1]
        resolve(base64)
      } else {
        reject(new Error("Failed to convert blob to base64"))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
} 
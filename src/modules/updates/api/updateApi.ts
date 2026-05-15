export type UpdateManifest = {
  apk_url: string
  force_update?: boolean
  latest_version: string
  latest_version_code: number
  message?: string
  min_supported_version_code: number
  release_notes?: string[]
}

export async function fetchUpdateManifest(manifestUrl: string) {
  const response = await fetch(manifestUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Update manifest request failed with status ${response.status}`)
  }

  const manifest = (await response.json()) as Partial<UpdateManifest>

  if (
    typeof manifest.apk_url !== 'string' ||
    typeof manifest.latest_version !== 'string' ||
    typeof manifest.latest_version_code !== 'number' ||
    typeof manifest.min_supported_version_code !== 'number'
  ) {
    throw new Error('Update manifest is missing required fields')
  }

  return {
    ...manifest,
    // Native Linking cannot open a site-relative path, but keeping the hosted JSON
    // relative is useful when the same file ships with the static landing page.
    apk_url: resolveManifestUrl(manifestUrl, manifest.apk_url),
  } as UpdateManifest
}

function resolveManifestUrl(manifestUrl: string, value: string) {
  try {
    return new URL(value, manifestUrl).toString()
  } catch {
    return value
  }
}

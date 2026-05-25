import axios from 'axios'
import { config } from '../config'
import { AppError } from '../middleware/error.middleware'

interface SearchResult {
  videoId: string
  title: string
  artist: string
  duration: number
  thumbnails: {
    default: string
    medium: string
    high: string
  }
}

interface CacheEntry {
  results: SearchResult[]
  timestamp: number
}

const searchCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000

export async function searchSongs(query: string): Promise<SearchResult[]> {
  const cacheKey = query.toLowerCase().trim()

  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results
  }

  try {
    const response = await axios.get(`${config.ytMusic.apiUrl}/search`, {
      params: {
        q: query,
        part: 'snippet',
        maxResults: 20,
        type: 'video',
        videoCategoryId: '10',
      },
      timeout: 10000,
    })

    const results: SearchResult[] = normalizeSearchResults(response.data)

    searchCache.set(cacheKey, {
      results,
      timestamp: Date.now(),
    })

    return results
  } catch {
    // Fallback to YouTube public search API if available
    try {
      const fallbackResponse = await axios.get(
        `https://www.youtube.com/results`,
        {
          params: { search_query: query },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          },
          timeout: 8000,
        }
      )

      const html = fallbackResponse.data as string
      const results = parseYoutubeHtml(html, query)

      searchCache.set(cacheKey, {
        results,
        timestamp: Date.now(),
      })

      return results
    } catch {
      throw new AppError('Failed to search songs', 502, 'SEARCH_FAILED')
    }
  }
}

function normalizeSearchResults(data: unknown): SearchResult[] {
  const results: SearchResult[] = []

  try {
    const items = (data as any).items || (data as any).results || []
    for (const item of items) {
      const videoId = item.id?.videoId || item.id || item.videoId
      if (!videoId) continue

      let duration = 0
      if (item.duration) {
        if (typeof item.duration === 'number') {
          duration = item.duration
        } else {
          duration = parseDuration(item.duration)
        }
      } else if (item.contentDetails?.duration) {
        duration = parseIsoDuration(item.contentDetails.duration)
      }

      const thumbnails = item.snippet?.thumbnails ||
        item.thumbnails || {
          default: item.thumbnail || '',
          medium: item.thumbnail_medium || '',
          high: item.thumbnail_high || '',
        }

      results.push({
        videoId,
        title: item.title || item.snippet?.title || 'Unknown Title',
        artist: item.artist || item.channelTitle || item.snippet?.channelTitle || 'Unknown Artist',
        duration,
        thumbnails: {
          default: thumbnails.default?.url || thumbnails.default || '',
          medium: thumbnails.medium?.url || thumbnails.medium || thumbnails.default?.url || thumbnails.default || '',
          high: thumbnails.high?.url || thumbnails.high || thumbnails.default?.url || thumbnails.default || '',
        },
      })
    }
  } catch {
    // Return whatever was parsed
  }

  return results
}

function parseYoutubeHtml(html: string, _query: string): SearchResult[] {
  const results: SearchResult[] = []

  try {
    const regex = /(?:var\s+ytInitialData\s*=\s*|window\[['"]ytInitialData['"]\]\s*=)(.+?)(?:;|\s*<\/script>)/s
    const match = html.match(regex)

    if (match && match[1]) {
      const data = JSON.parse(match[1])
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []

      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents || []
        for (const item of items) {
          const video = item?.videoRenderer
          if (!video) continue

          const videoId = video.videoId
          const title = video.title?.runs?.[0]?.text || 'Unknown Title'
          const artist = video.ownerText?.runs?.[0]?.text || 'Unknown Artist'
          const lengthText = video.lengthText?.simpleText || ''
          const duration = parseDuration(lengthText)

          const thumbnails = video.thumbnail?.thumbnails || []
          const defaultThumb = thumbnails[0]?.url || ''
          const mediumThumb = thumbnails[1]?.url || defaultThumb
          const highThumb = thumbnails[thumbnails.length - 1]?.url || defaultThumb

          results.push({
            videoId,
            title,
            artist,
            duration,
            thumbnails: {
              default: defaultThumb,
              medium: mediumThumb,
              high: highThumb,
            },
          })
        }
      }
    }
  } catch {
    // Fallback parsing failed
  }

  return results
}

function parseDuration(duration: string): number {
  if (!duration) return 0

  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return parts[0] || 0
}

function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

export function clearSearchCache(): void {
  searchCache.clear()
}

export type { SearchResult }

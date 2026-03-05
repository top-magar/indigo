import { useState, useCallback } from 'react'
import * as aiClient from './api-client'
import type { ImageAnalysisResult } from './api-client'

export function useAIImageAnalysis() {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (imageUrl: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await aiClient.analyzeImage(imageUrl)
      setResult(data)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { analyze, result, loading, error, reset: () => { setResult(null); setError(null) } }
}

export function useAIAltText() {
  const [altText, setAltText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = useCallback(async (imageUrl: string) => {
    setLoading(true)
    try {
      const data = await aiClient.generateAltText(imageUrl)
      setAltText(data.content ?? null)
      return data.content
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { generate, altText, loading }
}

export function useAITranslate() {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = useCallback(async (content: string, targetLanguage: string, sourceLanguage?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await aiClient.translateText(content, targetLanguage, sourceLanguage)
      setTranslatedContent(data.translatedContent ?? null)
      return data.translatedContent
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Translation failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { translate, translatedContent, loading, error, reset: () => { setTranslatedContent(null); setError(null) } }
}

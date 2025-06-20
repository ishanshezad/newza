import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Languages, Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { TranslationService } from '../lib/translationService'

export function TranslationProcessingPanel() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleProcessArticles = async (forceRetranslate = false) => {
    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const result = await TranslationService.processArticles({
        limit: 100,
        forceRetranslate
      })
      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-blue-500/20">
          <Languages className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Translation & Categorization</h3>
          <p className="text-sm text-muted-foreground">
            Process articles for translation and automatic categorization
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleProcessArticles(false)}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Process New Articles
        </button>

        <button
          onClick={() => handleProcessArticles(true)}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reprocess All
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Processing Complete</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Processed: {result.processed} articles</p>
            <p>Translated: {result.translated} articles</p>
            {result.errors && result.errors.length > 0 && (
              <p className="text-yellow-400">Errors: {result.errors.length}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Processing Failed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </motion.div>
      )}

      {/* Processing Status */}
      {processing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Processing Articles...</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Translating Bangla content and analyzing articles for categorization
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Languages, Tag } from 'lucide-react'
import { TranslationProcessingPanel } from './TranslationProcessingPanel'

export function AdminPanel() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-3 rounded-full bg-primary/20">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage news aggregation and processing</p>
          </div>
        </motion.div>

        {/* Translation Processing */}
        <TranslationProcessingPanel />

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-500/20">
                <Database className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">RSS Sources</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage news sources and RSS feeds
            </p>
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Manage Sources
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Tag className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Auto Tagging</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure automatic article tagging
            </p>
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              Configure Tags
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-orange-500/20">
                <Languages className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold">Translation Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure translation preferences
            </p>
            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Settings
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
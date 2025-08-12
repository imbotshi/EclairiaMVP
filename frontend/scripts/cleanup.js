#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Fichiers et dossiers potentiellement inutilisés
const POTENTIAL_UNUSED_FILES = [
  'frontend/src/TestRadioPage.vue',
  'frontend/src/components/TestNav.vue',
  'frontend/src/components/RadioTester.vue',
  'frontend/src/components/SpotifyWaveform.vue',
  'frontend/src/utils/gestureManager.js',
  'frontend/src/utils/visualizationManager.js',
  'frontend/src/services/radioValidator.js',
  'frontend/src/config/mapbox.js',
  'frontend/src/supabase.js',
  'frontend/audios_table.sql',
  'frontend/test_insert_audios.sql',
  'frontend/Example',
  'frontend/Voice Note',
  'frontend/Question',
  'frontend/WEBRADIO.mdc',
  'frontend/countries_analysis.json',
  'frontend/test_response.json',
  'frontend/builder.config.json'
]

// Analyser l'utilisation des fichiers
function analyzeFileUsage() {
  console.log('🔍 ANALYSE DE L\'UTILISATION DES FICHIERS')
  console.log('=======================================')
  
  const srcDir = path.join(__dirname, '..', 'src')
  const usedFiles = new Set()
  
  function scanImports(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanImports(filePath)
      } else if (file.endsWith('.vue') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Extraire les imports relatifs
        const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
        let match
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1]
          
          if (importPath.startsWith('.')) {
            // Résoudre le chemin relatif
            const resolvedPath = path.resolve(path.dirname(filePath), importPath)
            usedFiles.add(resolvedPath)
            
            // Ajouter les extensions possibles
            if (!resolvedPath.endsWith('.vue') && !resolvedPath.endsWith('.js')) {
              usedFiles.add(resolvedPath + '.vue')
              usedFiles.add(resolvedPath + '.js')
            }
          }
        }
      }
    })
  }
  
  scanImports(srcDir)
  
  console.log('\n✅ Fichiers utilisés:')
  usedFiles.forEach(file => {
    console.log(`  - ${file}`)
  })
  
  return usedFiles
}

// Identifier les fichiers inutilisés
function findUnusedFiles(usedFiles) {
  console.log('\n⚠️ FICHIERS POTENTIELLEMENT INUTILISÉS')
  console.log('=====================================')
  
  const unusedFiles = []
  
  POTENTIAL_UNUSED_FILES.forEach(filePath => {
    const fullPath = path.resolve(__dirname, '..', '..', filePath)
    
    if (fs.existsSync(fullPath)) {
      const isUsed = Array.from(usedFiles).some(usedFile => 
        usedFile.includes(path.basename(filePath))
      )
      
      if (!isUsed) {
        unusedFiles.push(filePath)
        console.log(`  - ${filePath}`)
      }
    }
  })
  
  return unusedFiles
}

// Nettoyer les console.log restants
function cleanConsoleLogs() {
  console.log('\n🧹 NETTOYAGE DES CONSOLE.LOG')
  console.log('============================')
  
  const srcDir = path.join(__dirname, '..', 'src')
  let totalCleaned = 0
  
  function cleanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content
    
    // Supprimer les console.log, console.warn, console.error
    let cleanedContent = content
      .replace(/console\.log\([^)]*\);?\s*/g, '')
      .replace(/console\.warn\([^)]*\);?\s*/g, '')
      .replace(/console\.error\([^)]*\);?\s*/g, '')
    
    if (cleanedContent !== originalContent) {
      fs.writeFileSync(filePath, cleanedContent)
      totalCleaned++
      console.log(`  - Nettoyé: ${path.relative(srcDir, filePath)}`)
    }
  }
  
  function scanAndClean(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanAndClean(filePath)
      } else if (file.endsWith('.vue') || file.endsWith('.js')) {
        cleanFile(filePath)
      }
    })
  }
  
  scanAndClean(srcDir)
  
  console.log(`\n✅ ${totalCleaned} fichiers nettoyés`)
}

// Exécuter l'analyse et le nettoyage
function main() {
  const usedFiles = analyzeFileUsage()
  const unusedFiles = findUnusedFiles(usedFiles)
  
  console.log(`\n📊 RÉSUMÉ`)
  console.log('==========')
  console.log(`Fichiers utilisés: ${usedFiles.size}`)
  console.log(`Fichiers potentiellement inutilisés: ${unusedFiles.length}`)
  
  if (unusedFiles.length > 0) {
    console.log('\n💡 RECOMMANDATIONS:')
    console.log('==================')
    console.log('1. Vérifier manuellement chaque fichier avant suppression')
    console.log('2. Créer des tests pour s\'assurer qu\'aucune fonctionnalité n\'est cassée')
    console.log('3. Supprimer les fichiers un par un avec des commits séparés')
  }
  
  // Nettoyer les console.log
  cleanConsoleLogs()
}

main() 
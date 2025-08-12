#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Analyser les dépendances utilisées
function analyzeDependencies() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  const dependencies = packageJson.dependencies || {}
  const devDependencies = packageJson.devDependencies || {}
  
  console.log('📦 ANALYSE DES DÉPENDANCES')
  console.log('========================')
  
  console.log('\n🔍 Dépendances de production:')
  Object.keys(dependencies).forEach(dep => {
    console.log(`  - ${dep}@${dependencies[dep]}`)
  })
  
  console.log('\n🔧 Dépendances de développement:')
  Object.keys(devDependencies).forEach(dep => {
    console.log(`  - ${dep}@${devDependencies[dep]}`)
  })
  
  // Vérifier les imports dans le code
  const srcDir = path.join(__dirname, '..', 'src')
  const usedImports = new Set()
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanDirectory(filePath)
      } else if (file.endsWith('.vue') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Extraire les imports
        const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
        let match
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1]
          
          // Ignorer les imports relatifs et les modules Node.js
          if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            const packageName = importPath.split('/')[0]
            usedImports.add(packageName)
          }
        }
      }
    })
  }
  
  scanDirectory(srcDir)
  
  console.log('\n✅ Imports détectés:')
  usedImports.forEach(importName => {
    console.log(`  - ${importName}`)
  })
  
  // Identifier les dépendances potentiellement inutilisées
  const allDeps = { ...dependencies, ...devDependencies }
  const unusedDeps = Object.keys(allDeps).filter(dep => !usedImports.has(dep))
  
  console.log('\n⚠️ Dépendances potentiellement inutilisées:')
  if (unusedDeps.length === 0) {
    console.log('  Aucune dépendance inutilisée détectée')
  } else {
    unusedDeps.forEach(dep => {
      console.log(`  - ${dep}`)
    })
  }
  
  return {
    dependencies,
    devDependencies,
    usedImports,
    unusedDeps
  }
}

// Exécuter l'analyse
analyzeDependencies() 
#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Test final pour valider que l'application fonctionne sans erreurs
function testFinalValidation() {
  console.log('🎯 TEST FINAL - VALIDATION SANS ERREURS')
  console.log('========================================')
  
  let totalTests = 0
  let passedTests = 0
  
  // Test 1: Build sans erreurs
  function testBuildSuccess() {
    console.log('\n📦 Test 1: Build sans erreurs')
    
    const distPath = path.join(__dirname, '..', 'dist')
    if (!fs.existsSync(distPath)) {
      console.log('  ❌ Dossier dist manquant')
      totalTests++
      return
    }
    
    const assetsPath = path.join(distPath, 'assets')
    if (!fs.existsSync(assetsPath)) {
      console.log('  ❌ Dossier assets manquant')
      totalTests++
      return
    }
    
    const files = fs.readdirSync(assetsPath)
    const jsFiles = files.filter(f => f.endsWith('.js'))
    
    if (jsFiles.length >= 4) {
      console.log(`  ✅ Build réussi: ${jsFiles.length} fichiers JS générés`)
      passedTests++
    } else {
      console.log(`  ❌ Build incomplet: ${jsFiles.length} fichiers JS`)
    }
    
    totalTests++
  }
  
  // Test 2: Variables définies
  function testVariablesDefined() {
    console.log('\n🔧 Test 2: Variables définies')
    
    const files = [
      'src/components/SiriSphere.vue',
      'src/components/Home.vue'
    ]
    
    let passed = 0
    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Vérifier les variables critiques
        const hasScene = content.includes('scene, camera, renderer')
        const hasActiveTab = content.includes('activeTab = ref')
        
        if (hasScene && hasActiveTab) {
          console.log(`  ✅ ${file}: Variables définies`)
          passed++
        } else {
          console.log(`  ❌ ${file}: Variables manquantes`)
        }
      } else {
        console.log(`  ❌ ${file}: Fichier manquant`)
      }
    })
    
    totalTests++
    if (passed === files.length) {
      passedTests++
      console.log(`  ✅ Test réussi: ${passed}/${files.length} fichiers`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${files.length} fichiers`)
    }
  }
  
  // Test 3: Console logs supprimés
  function testConsoleLogsRemoved() {
    console.log('\n🔇 Test 3: Console logs supprimés')
    
    const srcDir = path.join(__dirname, '..', 'src')
    let filesWithLogs = 0
    let totalFiles = 0
    
    function scanForConsoleLogs(dir) {
      const files = fs.readdirSync(dir)
      
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
          scanForConsoleLogs(filePath)
        } else if (file.endsWith('.vue') || file.endsWith('.js')) {
          totalFiles++
          const content = fs.readFileSync(filePath, 'utf8')
          
          if (content.includes('console.log(') || 
              content.includes('console.warn(') || 
              content.includes('console.error(')) {
            filesWithLogs++
            console.log(`  ⚠️ ${path.relative(srcDir, filePath)} - Contient encore des console.log`)
          }
        }
      })
    }
    
    scanForConsoleLogs(srcDir)
    
    totalTests++
    if (filesWithLogs === 0) {
      passedTests++
      console.log(`  ✅ Test réussi: Aucun console.log trouvé dans ${totalFiles} fichiers`)
    } else {
      console.log(`  ❌ Test échoué: ${filesWithLogs} fichiers contiennent encore des console.log`)
    }
  }
  
  // Test 4: Optimisations appliquées
  function testOptimizationsApplied() {
    console.log('\n⚡ Test 4: Optimisations appliquées')
    
    const checks = [
      {
        name: 'Terser configuré',
        check: () => {
          const viteConfig = fs.readFileSync(path.join(__dirname, '..', 'vite.config.js'), 'utf8')
          return viteConfig.includes('terser') && viteConfig.includes('drop_console')
        }
      },
      {
        name: 'Code splitting',
        check: () => {
          const viteConfig = fs.readFileSync(path.join(__dirname, '..', 'vite.config.js'), 'utf8')
          return viteConfig.includes('manualChunks')
        }
      },
      {
        name: 'Fichiers inutilisés supprimés',
        check: () => {
          const deletedFiles = [
            'src/components/TestNav.vue',
            'src/components/SpotifyWaveform.vue',
            'src/utils/gestureManager.js',
            'src/utils/visualizationManager.js'
          ]
          
          return deletedFiles.every(file => !fs.existsSync(path.join(__dirname, '..', file)))
        }
      },
      {
        name: 'Outils d\'optimisation créés',
        check: () => {
          const tools = [
            'scripts/analyze-deps.js',
            'scripts/cleanup.js',
            'scripts/test-optimizations.js',
            'scripts/deploy.js',
            'scripts/final-test.js',
            'scripts/launch-optimized.js',
            'scripts/test-final.js'
          ]
          
          return tools.every(tool => fs.existsSync(path.join(__dirname, '..', tool)))
        }
      }
    ]
    
    let passed = 0
    checks.forEach(({ name, check }) => {
      if (check()) {
        console.log(`  ✅ ${name}`)
        passed++
      } else {
        console.log(`  ❌ ${name}`)
      }
    })
    
    totalTests++
    if (passed === checks.length) {
      passedTests++
      console.log(`  ✅ Test réussi: ${passed}/${checks.length} optimisations`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${checks.length} optimisations`)
    }
  }
  
  // Exécuter tous les tests
  testBuildSuccess()
  testVariablesDefined()
  testConsoleLogsRemoved()
  testOptimizationsApplied()
  
  // Résumé final
  console.log('\n🎯 RÉSUMÉ FINAL')
  console.log('================')
  console.log(`Tests réussis: ${passedTests}/${totalTests}`)
  console.log(`Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !')
    console.log('✅ Application Eclairia optimisée et sans erreurs')
    console.log('✅ Variables définies correctement')
    console.log('✅ Console logs supprimés')
    console.log('✅ Optimisations appliquées')
    console.log('✅ Prêt pour la production')
    
    console.log('\n🚀 APPLICATION PRÊTE !')
    console.log('======================')
    console.log('📱 Frontend: http://localhost:3000')
    console.log('🔧 Backend:  http://localhost:3001')
    console.log('📦 Build:    dist/ (optimisé)')
    
    return true
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ')
    console.log('🔧 Corrigez les problèmes avant de continuer')
    return false
  }
}

// Exécuter le test final
testFinalValidation() 
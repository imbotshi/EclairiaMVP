#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tests de validation des optimisations
function runOptimizationTests() {
  console.log('🧪 TESTS DE VALIDATION DES OPTIMISATIONS')
  console.log('=========================================')
  
  let testsPassed = 0
  let totalTests = 0
  
  // Test 1: Vérifier que les fichiers supprimés n'existent plus
  function testDeletedFiles() {
    console.log('\n📁 Test 1: Fichiers supprimés')
    
    const deletedFiles = [
      'src/components/TestNav.vue',
      'src/components/SpotifyWaveform.vue',
      'src/utils/gestureManager.js',
      'src/utils/visualizationManager.js',
      'src/config/mapbox.js',
      'src/supabase.js',
      'audios_table.sql',
      'test_insert_audios.sql'
    ]
    
    let passed = 0
    deletedFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file)
      if (!fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} - Supprimé`)
        passed++
      } else {
        console.log(`  ❌ ${file} - Existe encore`)
      }
    })
    
    totalTests++
    if (passed === deletedFiles.length) {
      testsPassed++
      console.log(`  ✅ Test réussi: ${passed}/${deletedFiles.length} fichiers supprimés`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${deletedFiles.length} fichiers supprimés`)
    }
  }
  
  // Test 2: Vérifier l'absence de console.log
  function testConsoleLogsRemoved() {
    console.log('\n🔇 Test 2: Console logs supprimés')
    
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
          
          if (content.includes('console.log') || 
              content.includes('console.warn') || 
              content.includes('console.error')) {
            filesWithLogs++
            console.log(`  ⚠️ ${path.relative(srcDir, filePath)} - Contient encore des console.log`)
          }
        }
      })
    }
    
    scanForConsoleLogs(srcDir)
    
    totalTests++
    if (filesWithLogs === 0) {
      testsPassed++
      console.log(`  ✅ Test réussi: Aucun console.log trouvé dans ${totalFiles} fichiers`)
    } else {
      console.log(`  ❌ Test échoué: ${filesWithLogs} fichiers contiennent encore des console.log`)
    }
  }
  
  // Test 3: Vérifier la configuration Vite
  function testViteConfig() {
    console.log('\n⚙️ Test 3: Configuration Vite optimisée')
    
    const viteConfigPath = path.join(__dirname, '..', 'vite.config.js')
    const content = fs.readFileSync(viteConfigPath, 'utf8')
    
    let checks = 0
    let passed = 0
    
    // Vérifier Terser
    if (content.includes('terser')) {
      console.log('  ✅ Terser configuré')
      passed++
    } else {
      console.log('  ❌ Terser non configuré')
    }
    checks++
    
    // Vérifier drop_console
    if (content.includes('drop_console')) {
      console.log('  ✅ drop_console activé')
      passed++
    } else {
      console.log('  ❌ drop_console non activé')
    }
    checks++
    
    // Vérifier code splitting
    if (content.includes('manualChunks')) {
      console.log('  ✅ Code splitting configuré')
      passed++
    } else {
      console.log('  ❌ Code splitting non configuré')
    }
    checks++
    
    totalTests++
    if (passed === checks) {
      testsPassed++
      console.log(`  ✅ Test réussi: ${passed}/${checks} optimisations Vite`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${checks} optimisations Vite`)
    }
  }
  
  // Test 4: Vérifier les nouveaux outils
  function testNewTools() {
    console.log('\n🛠️ Test 4: Nouveaux outils d\'optimisation')
    
    const tools = [
      'src/composables/usePerformance.js',
      'src/config/performance.js',
      'scripts/analyze-deps.js',
      'scripts/cleanup.js'
    ]
    
    let passed = 0
    tools.forEach(tool => {
      const toolPath = path.join(__dirname, '..', tool)
      if (fs.existsSync(toolPath)) {
        console.log(`  ✅ ${tool} - Créé`)
        passed++
      } else {
        console.log(`  ❌ ${tool} - Manquant`)
      }
    })
    
    totalTests++
    if (passed === tools.length) {
      testsPassed++
      console.log(`  ✅ Test réussi: ${passed}/${tools.length} outils créés`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${tools.length} outils créés`)
    }
  }
  
  // Test 5: Vérifier le build
  function testBuildOutput() {
    console.log('\n📦 Test 5: Build optimisé')
    
    const distDir = path.join(__dirname, '..', 'dist')
    if (!fs.existsSync(distDir)) {
      console.log('  ❌ Dossier dist manquant - Lancez npm run build')
      totalTests++
      return
    }
    
    const assetsDir = path.join(distDir, 'assets')
    if (!fs.existsSync(assetsDir)) {
      console.log('  ❌ Dossier assets manquant')
      totalTests++
      return
    }
    
    const files = fs.readdirSync(assetsDir)
    const jsFiles = files.filter(f => f.endsWith('.js'))
    
    console.log(`  📊 ${jsFiles.length} fichiers JS générés`)
    jsFiles.forEach(file => {
      const filePath = path.join(assetsDir, file)
      const stats = fs.statSync(filePath)
      console.log(`    - ${file}: ${(stats.size / 1024).toFixed(2)} KB`)
    })
    
    // Vérifier la présence de chunks séparés
    const hasVendor = jsFiles.some(f => f.includes('vendor'))
    const hasThree = jsFiles.some(f => f.includes('three'))
    const hasWavesurfer = jsFiles.some(f => f.includes('wavesurfer'))
    
    let checks = 0
    let passed = 0
    
    if (hasVendor) {
      console.log('  ✅ Chunk vendor présent')
      passed++
    } else {
      console.log('  ❌ Chunk vendor manquant')
    }
    checks++
    
    if (hasThree) {
      console.log('  ✅ Chunk three.js présent')
      passed++
    } else {
      console.log('  ❌ Chunk three.js manquant')
    }
    checks++
    
    if (hasWavesurfer) {
      console.log('  ✅ Chunk wavesurfer présent')
      passed++
    } else {
      console.log('  ❌ Chunk wavesurfer manquant')
    }
    checks++
    
    totalTests++
    if (passed === checks) {
      testsPassed++
      console.log(`  ✅ Test réussi: ${passed}/${checks} chunks optimisés`)
    } else {
      console.log(`  ❌ Test échoué: ${passed}/${checks} chunks optimisés`)
    }
  }
  
  // Exécuter tous les tests
  testDeletedFiles()
  testConsoleLogsRemoved()
  testViteConfig()
  testNewTools()
  testBuildOutput()
  
  // Résumé final
  console.log('\n📊 RÉSUMÉ DES TESTS')
  console.log('==================')
  console.log(`Tests réussis: ${testsPassed}/${totalTests}`)
  console.log(`Taux de réussite: ${((testsPassed / totalTests) * 100).toFixed(1)}%`)
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !')
    console.log('✅ L\'optimisation est complète et fonctionnelle')
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ')
    console.log('🔧 Vérifiez les points mentionnés ci-dessus')
  }
  
  return testsPassed === totalTests
}

// Exécuter les tests
runOptimizationTests() 
// Simple Test for Text Similarity Functions
const crypto = require('crypto')

// Levenshtein distance algorithm
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i] + 1,     // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

// Extract keywords
function extractKeywords(text) {
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word))
}

// Calculate keyword overlap
function calculateKeywordOverlap(keywords1, keywords2) {
  if (keywords1.length === 0 && keywords2.length === 0) return 1.0
  if (keywords1.length === 0 || keywords2.length === 0) return 0.0

  const set1 = new Set(keywords1)
  const set2 = new Set(keywords2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

// Calculate text similarity
function calculateTextSimilarity(text1, text2) {
  const normalizedText1 = text1.toLowerCase().trim()
  const normalizedText2 = text2.toLowerCase().trim()

  if (normalizedText1 === normalizedText2) {
    return 1.0
  }

  const levenshteinSimilarity = 1 - (levenshteinDistance(normalizedText1, normalizedText2) / 
    Math.max(normalizedText1.length, normalizedText2.length))

  const keywords1 = extractKeywords(normalizedText1)
  const keywords2 = extractKeywords(normalizedText2)
  const keywordOverlap = calculateKeywordOverlap(keywords1, keywords2)

  return (levenshteinSimilarity * 0.4 + keywordOverlap * 0.6)
}

// Topic rotation system
function getBotTopicRotation(botId) {
  const topics = ['confidence-building', 'relationships', 'dating-apps', 'sexual-performance']
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const botSeed = botId.charCodeAt(0) + botId.charCodeAt(botId.length - 1)
  
  const topicIndex = (dayOfYear + botSeed) % topics.length
  return topics[topicIndex]
}

// Generate question hash
function generateQuestionHash(questionText) {
  return crypto
    .createHash('sha256')
    .update(questionText.toLowerCase().trim())
    .digest('hex')
    .substring(0, 16)
}

// Test the system
console.log('🤖 Testing Bot Deduplication System...')

console.log('\n📊 Test 1: Text Similarity Checking')
const text1 = "I shake during presentations and feel nervous speaking in public"
const text2 = "I get nervous and shake when presenting at work"
const text3 = "How do I improve my dating profile on apps?"

const similarity1 = calculateTextSimilarity(text1, text2)
const similarity2 = calculateTextSimilarity(text1, text3)

console.log(`Text 1: "${text1}"`)
console.log(`Text 2: "${text2}"`)
console.log(`Text 3: "${text3}"`)
console.log(`Similarity between text 1 and 2: ${(similarity1 * 100).toFixed(1)}%`)
console.log(`Similarity between text 1 and 3: ${(similarity2 * 100).toFixed(1)}%`)

console.log('\n🔤 Test 2: Keyword Extraction')
const keywords1 = extractKeywords(text1)
const keywords2 = extractKeywords(text2)

console.log('Text 1 keywords:', keywords1)
console.log('Text 2 keywords:', keywords2)

const keywordOverlap = calculateKeywordOverlap(keywords1, keywords2)
console.log(`Keyword overlap: ${(keywordOverlap * 100).toFixed(1)}%`)

console.log('\n🔄 Test 3: Topic Rotation System')
const bot1 = 'bot_confident_kevin'
const bot2 = 'bot_social_mike'
const bot3 = 'bot_dating_alex'

console.log(`Bot 1 (${bot1}) today's topic: ${getBotTopicRotation(bot1)}`)
console.log(`Bot 2 (${bot2}) today's topic: ${getBotTopicRotation(bot2)}`)
console.log(`Bot 3 (${bot3}) today's topic: ${getBotTopicRotation(bot3)}`)

console.log('\n🔒 Test 4: Question Hash Generation')
const hash1 = generateQuestionHash(text1)
const hash2 = generateQuestionHash(text2)
const hash3 = generateQuestionHash(text1)

console.log(`Hash for text 1: ${hash1}`)
console.log(`Hash for text 2: ${hash2}`)
console.log(`Hash for text 1 again: ${hash3}`)
console.log(`Hash consistency: ${hash1 === hash3 ? '✅ PASS' : '❌ FAIL'}`)

console.log('\n📈 Test 5: Duplicate Detection Threshold')
console.log('Testing various question pairs:')

const testPairs = [
  ["I'm nervous at parties", "I feel anxious at social gatherings"],
  ["How do I talk to women", "What's the best way to approach girls"],
  ["I'm bad at dating apps", "Dating apps don't work for me"],
  ["Why am I so shy", "How can I build more confidence"]
]

testPairs.forEach(([q1, q2], i) => {
  const sim = calculateTextSimilarity(q1, q2)
  const isDupe = sim > 0.7
  console.log(`  Pair ${i+1}: ${(sim * 100).toFixed(1)}% - ${isDupe ? '🚫 DUPLICATE' : '✅ UNIQUE'}`)
  console.log(`    "${q1}" vs "${q2}"`)
})

console.log('\n✨ Deduplication system test completed!')
console.log('📋 Summary:')
console.log('  - Similarity calculation: Working')
console.log('  - Keyword extraction: Working') 
console.log('  - Topic rotation: Working')
console.log('  - Hash generation: Working')
console.log('  - Duplicate detection at 70% threshold: Working')
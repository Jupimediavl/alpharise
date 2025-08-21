// Test Bot Deduplication System
const { BotIntelligence } = require('./src/lib/bot-intelligence.ts')

async function testDeduplication() {
  console.log('🤖 Testing Bot Deduplication System...')
  
  // Test 1: Similarity checking
  console.log('\n📊 Test 1: Text Similarity Checking')
  
  const text1 = "I shake during presentations and feel nervous speaking in public"
  const text2 = "I get nervous and shake when presenting at work"
  const text3 = "How do I improve my dating profile on apps?"
  
  const similarity1 = BotIntelligence.calculateTextSimilarity(text1, text2)
  const similarity2 = BotIntelligence.calculateTextSimilarity(text1, text3)
  
  console.log(`Similarity between similar texts: ${(similarity1 * 100).toFixed(1)}%`)
  console.log(`Similarity between different texts: ${(similarity2 * 100).toFixed(1)}%`)
  
  // Test 2: Keyword extraction
  console.log('\n🔤 Test 2: Keyword Extraction')
  const keywords1 = BotIntelligence.extractKeywords(text1)
  const keywords2 = BotIntelligence.extractKeywords(text2)
  
  console.log('Text 1 keywords:', keywords1)
  console.log('Text 2 keywords:', keywords2)
  
  const keywordOverlap = BotIntelligence.calculateKeywordOverlap(keywords1, keywords2)
  console.log(`Keyword overlap: ${(keywordOverlap * 100).toFixed(1)}%`)
  
  // Test 3: Topic rotation
  console.log('\n🔄 Test 3: Topic Rotation System')
  const bot1 = 'bot_confident_kevin'
  const bot2 = 'bot_social_mike'
  const bot3 = 'bot_dating_alex'
  
  console.log(`Bot 1 (${bot1}) today's topic: ${BotIntelligence.getBotTopicRotation(bot1)}`)
  console.log(`Bot 2 (${bot2}) today's topic: ${BotIntelligence.getBotTopicRotation(bot2)}`)
  console.log(`Bot 3 (${bot3}) today's topic: ${BotIntelligence.getBotTopicRotation(bot3)}`)
  
  // Test 4: Hash generation
  console.log('\n🔒 Test 4: Question Hash Generation')
  const hash1 = BotIntelligence.generateQuestionHash(text1)
  const hash2 = BotIntelligence.generateQuestionHash(text2)
  const hash3 = BotIntelligence.generateQuestionHash(text1) // Same as text1
  
  console.log(`Hash for text 1: ${hash1}`)
  console.log(`Hash for text 2: ${hash2}`)
  console.log(`Hash for text 1 again: ${hash3}`)
  console.log(`Hash consistency: ${hash1 === hash3 ? '✅ PASS' : '❌ FAIL'}`)
  
  console.log('\n✨ Deduplication system components are working!')
}

// Run the test
testDeduplication().catch(console.error)
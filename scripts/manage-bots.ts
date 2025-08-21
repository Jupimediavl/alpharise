// Bot management script - control bot phases and activity
// Run with: npx tsx scripts/manage-bots.ts [command]

import { supabase } from '../src/lib/supabase'

// Commands
const commands = {
  // Activate bootstrap phase - high activity content generation
  async startBootstrap() {
    console.log('🚀 Starting bootstrap phase...')
    
    // Set questioners to high activity (7-9)
    const { error: e1 } = await supabase
      .from('bots')
      .update({ 
        activity_level: 8,
        status: 'active'
      })
      .eq('type', 'questioner')
    
    // Set answerers to medium-high activity (6-8)
    const { error: e2 } = await supabase
      .from('bots')
      .update({ 
        activity_level: 7,
        status: 'active'
      })
      .eq('type', 'answerer')
    
    // Set mixed to high activity
    const { error: e3 } = await supabase
      .from('bots')
      .update({ 
        activity_level: 8,
        status: 'active'
      })
      .eq('type', 'mixed')
    
    console.log('✅ Bootstrap phase activated')
    console.log('All bots set to high activity for content generation')
  },
  
  // Switch to maintenance phase - lower activity
  async startMaintenance() {
    console.log('🔧 Starting maintenance phase...')
    
    // Reduce questioners (keep only 10 active)
    const { data: questioners } = await supabase
      .from('bots')
      .select('id')
      .eq('type', 'questioner')
      .limit(10)
    
    // Deactivate most questioners
    await supabase
      .from('bots')
      .update({ status: 'paused' })
      .eq('type', 'questioner')
      .not('id', 'in', `(${questioners?.map(q => q.id).join(',')})`)
    
    // Keep active questioners at low activity
    await supabase
      .from('bots')
      .update({ activity_level: 3 })
      .eq('type', 'questioner')
      .eq('status', 'active')
    
    // Keep 40-50 answerers active with medium activity
    const { data: answerers } = await supabase
      .from('bots')
      .select('id')
      .eq('type', 'answerer')
      .limit(45)
    
    // Set selected answerers to medium activity
    if (answerers) {
      await supabase
        .from('bots')
        .update({ 
          activity_level: 4,
          status: 'active'
        })
        .in('id', answerers.map(a => a.id))
    }
    
    // Pause other answerers
    await supabase
      .from('bots')
      .update({ status: 'paused' })
      .eq('type', 'answerer')
      .not('id', 'in', `(${answerers?.map(a => a.id).join(',')})`)
    
    console.log('✅ Maintenance phase activated')
    console.log('Reduced to ~50 active bots with lower activity')
  },
  
  // Get current bot statistics
  async stats() {
    console.log('📊 Fetching bot statistics...')
    
    const { data: bots } = await supabase
      .from('bots')
      .select('type, status, activity_level')
    
    if (!bots) {
      console.error('Could not fetch bots')
      return
    }
    
    const stats = {
      total: bots.length,
      active: bots.filter(b => b.status === 'active').length,
      paused: bots.filter(b => b.status === 'paused').length,
      byType: {
        questioner: {
          total: bots.filter(b => b.type === 'questioner').length,
          active: bots.filter(b => b.type === 'questioner' && b.status === 'active').length
        },
        answerer: {
          total: bots.filter(b => b.type === 'answerer').length,
          active: bots.filter(b => b.type === 'answerer' && b.status === 'active').length
        },
        mixed: {
          total: bots.filter(b => b.type === 'mixed').length,
          active: bots.filter(b => b.type === 'mixed' && b.status === 'active').length
        }
      },
      avgActivityLevel: {
        all: bots.reduce((sum, b) => sum + b.activity_level, 0) / bots.length,
        active: bots.filter(b => b.status === 'active').reduce((sum, b) => sum + b.activity_level, 0) / bots.filter(b => b.status === 'active').length
      }
    }
    
    console.log('\n📈 Bot Statistics:')
    console.log(`Total bots: ${stats.total} (${stats.active} active, ${stats.paused} paused)`)
    console.log('\nBy Type:')
    console.log(`- Questioners: ${stats.byType.questioner.total} total, ${stats.byType.questioner.active} active`)
    console.log(`- Answerers: ${stats.byType.answerer.total} total, ${stats.byType.answerer.active} active`)
    console.log(`- Mixed: ${stats.byType.mixed.total} total, ${stats.byType.mixed.active} active`)
    console.log('\nActivity Levels:')
    console.log(`- Average (all): ${stats.avgActivityLevel.all.toFixed(1)}`)
    console.log(`- Average (active): ${stats.avgActivityLevel.active.toFixed(1)}`)
  },
  
  // Pause all bots
  async pauseAll() {
    console.log('⏸️ Pausing all bots...')
    
    const { error } = await supabase
      .from('bots')
      .update({ status: 'paused' })
      .neq('id', 'dummy') // Update all
    
    if (error) {
      console.error('Error pausing bots:', error)
    } else {
      console.log('✅ All bots paused')
    }
  },
  
  // Activate specific number of bots
  async activate(count: number = 50) {
    console.log(`🔄 Activating ${count} bots...`)
    
    // Get random selection of bots
    const { data: bots } = await supabase
      .from('bots')
      .select('id, type')
      .eq('status', 'paused')
      .limit(count)
    
    if (bots && bots.length > 0) {
      const { error } = await supabase
        .from('bots')
        .update({ status: 'active' })
        .in('id', bots.map(b => b.id))
      
      if (!error) {
        console.log(`✅ Activated ${bots.length} bots`)
        const types = bots.reduce((acc, b) => {
          acc[b.type] = (acc[b.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('By type:', types)
      }
    } else {
      console.log('No paused bots to activate')
    }
  },
  
  // Clean duplicate bots
  async cleanup() {
    console.log('🧹 Cleaning up duplicate bots...')
    
    const { data: bots } = await supabase
      .from('bots')
      .select('id, username')
      .order('created_at', { ascending: true })
    
    if (!bots) return
    
    const seen = new Set()
    const duplicates = []
    
    for (const bot of bots) {
      if (seen.has(bot.username)) {
        duplicates.push(bot.id)
      } else {
        seen.add(bot.username)
      }
    }
    
    if (duplicates.length > 0) {
      const { error } = await supabase
        .from('bots')
        .delete()
        .in('id', duplicates)
      
      if (!error) {
        console.log(`✅ Removed ${duplicates.length} duplicate bots`)
      }
    } else {
      console.log('No duplicates found')
    }
  },
  
  // Set activity levels by type
  async setActivity(type: string, level: number) {
    console.log(`⚡ Setting ${type} bots to activity level ${level}...`)
    
    const { error } = await supabase
      .from('bots')
      .update({ activity_level: level })
      .eq('type', type)
      .eq('status', 'active')
    
    if (!error) {
      console.log(`✅ Updated ${type} bots to activity level ${level}`)
    } else {
      console.error('Error:', error)
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]
const param = args[1]

async function main() {
  console.log('🤖 Bot Management Tool\n')
  
  switch(command) {
    case 'bootstrap':
      await commands.startBootstrap()
      break
    case 'maintenance':
      await commands.startMaintenance()
      break
    case 'stats':
      await commands.stats()
      break
    case 'pause':
      await commands.pauseAll()
      break
    case 'activate':
      await commands.activate(param ? parseInt(param) : 50)
      break
    case 'cleanup':
      await commands.cleanup()
      break
    case 'set-activity':
      if (args[1] && args[2]) {
        await commands.setActivity(args[1], parseInt(args[2]))
      } else {
        console.log('Usage: set-activity [type] [level]')
      }
      break
    default:
      console.log('Available commands:')
      console.log('  bootstrap      - Start high-activity content generation phase')
      console.log('  maintenance    - Switch to low-activity maintenance phase')
      console.log('  stats          - Show bot statistics')
      console.log('  pause          - Pause all bots')
      console.log('  activate [n]   - Activate n bots (default: 50)')
      console.log('  cleanup        - Remove duplicate bots')
      console.log('  set-activity [type] [level] - Set activity level for bot type')
      console.log('\nExamples:')
      console.log('  npx tsx scripts/manage-bots.ts bootstrap')
      console.log('  npx tsx scripts/manage-bots.ts activate 75')
      console.log('  npx tsx scripts/manage-bots.ts set-activity answerer 5')
  }
}

main().catch(console.error)
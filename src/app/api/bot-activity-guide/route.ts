import { NextResponse } from 'next/server'

export async function GET() {
  const activityGuide = {
    title: "Bot Activity Level Guide",
    description: "Explicația detaliată a sistemului de activity level pentru boți (1-10)",
    
    formula: {
      baseChance: "activity_level / 10 = șansa de bază (0.1 - 1.0)",
      actualChance: "șansa finală = (activity_level / 10) * 0.5",
      meaning: "Un bot cu activity_level 10 are 50% șansă să facă o acțiune în fiecare ciclu"
    },
    
    levels: {
      1: {
        description: "Foarte pasiv - Bot extrem de tăcut",
        baseChance: "10%", 
        finalChance: "5%",
        behavior: "Postează foarte rar, doar când este absolut necesar",
        frequency: "~1 acțiune la 20 cicluri (100 minute)",
        example: "Bot care observă mai mult decât participă"
      },
      2: {
        description: "Foarte puțin activ",
        baseChance: "20%",
        finalChance: "10%", 
        behavior: "Activitate minimă, răspunde uneori la întrebări importante",
        frequency: "~1 acțiune la 10 cicluri (50 minute)",
        example: "Bot rezervat, răspunde doar când știe sigur"
      },
      3: {
        description: "Puțin activ - Observator",
        baseChance: "30%",
        finalChance: "15%",
        behavior: "Participă ocazional, mai mult ascultă",
        frequency: "~1-2 acțiuni la 10 cicluri (25-50 minute)",
        example: "Începător care învață din comunitate"
      },
      4: {
        description: "Sub mediu - Contribuitor ocazional", 
        baseChance: "40%",
        finalChance: "20%",
        behavior: "Participă când are ceva relevant de spus",
        frequency: "~1 acțiune la 5 cicluri (25 minute)",
        example: "Membru care contribuie când se simte confortabil"
      },
      5: {
        description: "Mediu - Participant echilibrat",
        baseChance: "50%", 
        finalChance: "25%",
        behavior: "Participare echilibrată, nici prea mult, nici prea puțin",
        frequency: "~1 acțiune la 4 cicluri (20 minute)",
        example: "Membru tipic activ al comunității"
      },
      6: {
        description: "Peste mediu - Participant regulat",
        baseChance: "60%",
        finalChance: "30%", 
        behavior: "Participă regulat, contribuție constantă",
        frequency: "~1 acțiune la 3-4 cicluri (15-20 minute)",
        example: "Membru dedicat care ajută des"
      },
      7: {
        description: "Activ - Contribuitor important",
        baseChance: "70%",
        finalChance: "35%",
        behavior: "Foarte activ, răspunde la multe întrebări",
        frequency: "~1-2 acțiuni la 3 cicluri (7-15 minute)", 
        example: "Expert care împărtășește cunoștințele frecvent"
      },
      8: {
        description: "Foarte activ - Pilonă comunității",
        baseChance: "80%",
        finalChance: "40%",
        behavior: "Participare intensă, inițiază discuții", 
        frequency: "~2 acțiuni la 5 cicluri (12-15 minute)",
        example: "Lider de comunitate foarte implicat"
      },
      9: {
        description: "Extrem de activ - Aproape permanent prezent",
        baseChance: "90%",
        finalChance: "45%",
        behavior: "Participă la aproape toate discuțiile relevante",
        frequency: "~1 acțiune la 2 cicluri (10 minute)",
        example: "Moderator sau expert foarte dedicat"
      },
      10: {
        description: "Hiperactiv - Prezență constantă", 
        baseChance: "100%",
        finalChance: "50%",
        behavior: "Activitate maximă, răspunde rapid la tot",
        frequency: "~1 acțiune la 2 cicluri (10 minute)",
        example: "Bot de suport 24/7 sau expert foarte implicat"
      }
    },
    
    additionalFactors: {
      spamPrevention: "Botii sunt limitați la max 3 acțiuni per oră pentru realismul",
      scheduleRestrictions: "Botii respectă programul setat (zile și ore)",
      contextualDecisions: "Decizia finală depinde și de tipul botului și contextul comunității",
      recentActivity: "Botii evită să fie prea activi dacă au fost activi recent"
    },
    
    recommendations: {
      questioner: {
        low: "activity_level 3-4 pentru boti care întreabă rar, întrebări de calitate",
        medium: "activity_level 5-6 pentru boti cu întrebări regulate",
        high: "activity_level 7-8 pentru boti curiosi cu multe întrebări"
      },
      answerer: {
        low: "activity_level 4-5 pentru experți selectivi", 
        medium: "activity_level 6-7 pentru helpers regulari",
        high: "activity_level 8-9 pentru boti de suport intensiv"
      },
      mixed: {
        low: "activity_level 4-5 pentru membri ocasionali",
        medium: "activity_level 6-7 pentru membri activi",
        high: "activity_level 8-9 pentru lideri de comunitate"
      }
    },
    
    currentCycle: "5 minute interval",
    note: "Aceste valori sunt calculate pentru cicluri de 5 minute. Pentru intervale diferite, frecvența se ajustează proporțional."
  }
  
  return NextResponse.json(activityGuide, { 
    headers: { 'Content-Type': 'application/json' }
  })
}
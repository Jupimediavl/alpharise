// Test ALS problem mapping logic
const testProfile = {
  coach_id: 'chase',
  assessment_data: {
    problem_type: 'Premature Ejaculation',
    coach: 'chase'
  }
}

function testProblemMapping(profile) {
  // Map problem type from assessment data
  let primaryProblem = profile.assessment_data?.primary_problem
  if (!primaryProblem && profile.assessment_data?.problem_type) {
    const problemType = profile.assessment_data.problem_type.toLowerCase()
    if (problemType.includes('premature')) {
      primaryProblem = 'premature_ejaculation'
    } else if (problemType.includes('performance') || problemType.includes('anxiety')) {
      primaryProblem = 'performance_anxiety'
    } else if (problemType.includes('erectile')) {
      primaryProblem = 'erectile_dysfunction'
    } else if (problemType.includes('intimacy') || problemType.includes('communication')) {
      primaryProblem = 'intimacy_communication'
    } else {
      primaryProblem = 'confidence_building'
    }
  }
  // Fallback based on coach if no problem detected
  if (!primaryProblem) {
    const coachId = profile.coach_id
    if (coachId === 'chase') {
      primaryProblem = 'premature_ejaculation'
    } else if (coachId === 'blake') {
      primaryProblem = 'performance_anxiety'
    } else if (coachId === 'mason') {
      primaryProblem = 'erectile_dysfunction'
    } else if (coachId === 'knox') {
      primaryProblem = 'intimacy_communication'
    } else {
      primaryProblem = 'confidence_building'
    }
  }
  return primaryProblem
}

console.log('🧪 Testing problem mapping...')
console.log('Input profile:', testProfile)
console.log('Mapped primary problem:', testProblemMapping(testProfile))
console.log('Expected: premature_ejaculation')
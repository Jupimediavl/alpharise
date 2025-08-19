# AlphaRise Learning System Guide for ChatGPT

## System Overview

AlphaRise is a confidence-building platform that provides personalized coaching and learning paths for different types of users. The system works with **Problems** and **Exercises (Solutions)** that are tailored to each user type's specific challenges.

### Core Architecture

**Problems**: Major confidence challenges that users face
- Each problem is specific to a user type
- Users see 5 problems per user type in their learning path
- Problems are ordered by difficulty/importance (order_index)

**Exercises (Solutions)**: Practical actionable steps to solve problems
- Each problem has 4+ exercises/solutions
- Exercises have different difficulty levels: easy, medium, hard
- Each exercise gives points when completed (typically 5-15 points)
- Exercises take 5-30 minutes to complete
- Users progress through exercises to build confidence

### Database Structure

```sql
problems:
- id (UUID)
- title (TEXT) - Problem name
- description (TEXT) - What this problem is about
- user_type (overthinker|nervous|rookie|updown|surface)
- order_index (INTEGER) - Order of importance (1-5)

solutions (exercises):
- id (UUID)
- problem_id (UUID) - Links to parent problem
- title (TEXT) - Exercise name
- description (TEXT) - What this exercise teaches
- content (TEXT) - Detailed instructions/steps
- difficulty (easy|medium|hard)
- points_reward (INTEGER) - Points user gets (5-15 typically)
- estimated_minutes (INTEGER) - Time to complete (5-30)
- order_index (INTEGER) - Order within the problem
```

---

## User Types & Their Challenges

### 1. OVERTHINKER 👤
**Coach**: Logan "The Straight Shooter"
**Core Problem**: Overthinking & Analysis Paralysis
**Profile**: Brilliant analytical mind that works against them in social situations. They see every possible outcome, including scary ones.

**Key Issues to Address**:
- Analysis paralysis in social situations
- Mental fog and racing thoughts
- Fear of making wrong decisions
- Turning analytical skills into social advantages
- Getting out of their head and into action

**Focus Areas for Problems/Exercises**:
1. **Decision Making** - Quick decision techniques to stop overthinking
2. **Mind Control** - Methods to cut through mental fog
3. **Social Confidence** - Using analytical skills as strengths
4. **Action Taking** - Moving from thinking to doing
5. **Anxiety Management** - Confidence-building for anxious moments

---

### 2. NERVOUS ⚡
**Coach**: Chase "The Cool Cat"
**Core Problem**: Performance Anxiety
**Profile**: Wants to excel and perform their best, but performance pressure gets in the way of natural confidence.

**Key Issues to Address**:
- Performance anxiety in social/professional situations
- Staying cool under pressure
- Physical symptoms of nervousness (shaking, sweating, etc.)
- Transforming pressure into natural flow
- Building unshakeable confidence

**Focus Areas for Problems/Exercises**:
1. **Pressure Management** - Techniques to stay calm under pressure
2. **Physical Confidence** - Body language and physical presence training
3. **Performance Mindset** - Shifting from pressure to flow state
4. **Anxiety Elimination** - Methods to reduce performance anxiety
5. **Natural Confidence** - Building authentic, unforced confidence

---

### 3. ROOKIE 📚
**Coach**: Mason "The Patient Pro"
**Core Problem**: Feeling Behind & Lack of Experience
**Profile**: Honest about where they are and ready to learn. Self-awareness puts them ahead of most guys.

**Key Issues to Address**:
- Feeling inexperienced compared to others
- Not knowing where to start with confidence building
- Fear of judgment due to inexperience
- Building foundational social skills
- Systematic confidence education

**Focus Areas for Problems/Exercises**:
1. **Foundation Building** - Basic confidence principles and mindsets
2. **Social Skills Basics** - Fundamental interpersonal skills
3. **Confidence Education** - Step-by-step learning without judgment
4. **Practice Scenarios** - Safe ways to practice new skills
5. **Knowledge Application** - Turning learning into natural competence

---

### 4. UPDOWN 💎
**Coach**: Blake "The Reliable Guy" 
**Core Problem**: Inconsistent Confidence
**Profile**: Has incredible potential that shines through sometimes, but needs consistency to access confidence reliably.

**Key Issues to Address**:
- Confidence fluctuates dramatically
- Good days vs bad days inconsistency  
- Unable to maintain momentum
- Potential not being consistently accessed
- Need for reliable systems and habits

**Focus Areas for Problems/Exercises**:
1. **Consistency Training** - Building reliable confidence patterns
2. **System Building** - Creating habits for sustained success
3. **Momentum Management** - Maintaining forward progress
4. **Baseline Confidence** - Making good days the normal days
5. **Potential Unlocking** - Consistently accessing their best self

---

### 5. SURFACE ❤️
**Coach**: Knox "The Authentic One"
**Core Problem**: Shallow Connections & Lack of Depth
**Profile**: Understands that real intimacy comes from genuine connection. Their emotional intelligence is rare and valuable.

**Key Issues to Address**:
- Difficulty creating deep, meaningful connections
- Relationships stay at surface level
- Balancing emotional intelligence with confidence
- Fear of vulnerability
- Creating authentic relationships that matter

**Focus Areas for Problems/Exercises**:
1. **Deep Connection Skills** - Techniques for meaningful relationships
2. **Emotional Intelligence** - Using empathy as a strength
3. **Authentic Expression** - Being genuine while confident
4. **Vulnerability Training** - Safe ways to open up and connect
5. **Relationship Depth** - Moving from small talk to real connection

---

## Content Creation Guidelines

### Problem Creation
- **Title**: Clear, direct problem statement (e.g., "Analysis Paralysis in Social Situations")
- **Description**: 2-3 sentences explaining what this problem is and why it matters
- **Order**: 1-5, with 1 being most fundamental/important

### Exercise Creation  
- **Title**: Action-oriented name (e.g., "The 10-Second Decision Rule")
- **Description**: What this exercise teaches and its benefit
- **Content**: Step-by-step instructions, techniques, or frameworks
- **Difficulty**: 
  - **Easy**: 5-10 minutes, simple techniques, 5 points
  - **Medium**: 10-20 minutes, more complex, 10 points  
  - **Hard**: 20-30 minutes, advanced techniques, 15 points
- **Points**: Reward based on difficulty and value
- **Time**: Realistic estimate for completion

### Content Style
- **Direct and actionable** - Users want practical steps
- **Non-judgmental** - Meet users where they are
- **Results-focused** - Emphasize outcomes and benefits
- **Coach personality** - Reflect the assigned coach's approach
- **Real-world applicable** - Techniques they can use immediately

---

## Example Structure

**Problem**: "Decision Paralysis in Social Conversations" (Overthinker, Order: 1)
**Description**: "You know exactly what to say but get stuck analyzing every possible response, missing the natural flow of conversation."

**Exercise 1**: "The 3-Second Response Rule" (Easy, 5 points, 5 minutes)
**Exercise 2**: "Conversation Flow Mapping" (Medium, 10 points, 15 minutes) 
**Exercise 3**: "Advanced Response Selection" (Hard, 15 points, 25 minutes)
**Exercise 4**: "Social Situation Confidence Anchoring" (Medium, 10 points, 12 minutes)

Each exercise should build on the previous one, creating a complete learning path that solves the core problem.
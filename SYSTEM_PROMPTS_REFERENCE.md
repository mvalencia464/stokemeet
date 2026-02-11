# System Prompts Reference

This document contains all system prompts used for each summary type. These are designed specifically for the Gemini 2.0-flash model.

## Built-in Summary Types

### Free Tier

#### Chronological
```
Focus on a chapter-by-chapter summary of the meeting. Break the transcript into distinct topics or time segments and provide a short summary for each. Keep it concise and chronological.
```

### Most Used

#### General
```
Focus on the discovery process and insights. Capture any call's insights and key takeaways. Identify major discussion points, decisions made, and key action items without requiring a specific framework.
```

## Sales Frameworks

### Sales (General Discovery)
```
Focus on the discovery process. Identify the prospect's primary needs, the specific business challenges they are facing, and where they currently sit in their buying journey (e.g., researching, comparing, ready to buy).
```

### Sales - Sandler
```
Analyze the call using the Sandler Selling System. Specifically identify: 
1. Pain (The emotional/business reason for change)
2. Budget (Ability and willingness to pay)
3. Decision (Who, how, and when the decision is made)
```

### Sales - SPICED
```
Summarize using the SPICED framework:
- Situation (Context)
- Pain (The problem)
- Impact (Consequences of the pain)
- Critical Event (The deadline)
- Decision Criteria
```

### Sales - MEDDPICC
```
Extract details for:
- Metrics (Economic impact)
- Economic Buyer
- Decision Criteria
- Decision Process
- Paper Process
- Identified Pain
- Champions
- Competition
```

### Sales - BANT
```
Identify the four pillars of BANT:
- Budget (Is there a budget?)
- Authority (Who has the final say?)
- Need (What is the core problem?)
- Timeline (When do they need a solution?)
```

### Q&A
```
Identify every distinct question asked during the session and provide the corresponding answer given. Format as a clean List of Questions and Answers.
```

### Demo
```
Highlight the features or workflows showcased during the demo. Record the prospect's reaction to each feature and the specific business impact/value they associated with those features.
```

## Customer Success

### Customer Success (General)
```
Focus on the customer's health. Identify their current experience with the product, specific technical or business challenges mentioned, their short-term goals, and any questions they asked.
```

### Customer Success - REACH™
```
Summarize using the REACH™ framework:
- Retention signals
- Expansion opportunities
- Adoption levels
- Community involvement
- Health score indicators
```

## Internal & Operations

### One-on-One
```
Summarize the interaction focusing on:
- Employee updates
- Top priorities for the week
- Signals where support/coaching is needed
- List of feedback exchanged
```

### Project Update
```
Create a status report. For every task mentioned, identify:
- Current Status (On track/Blocked/Done)
- Summary of the discussion around it
- Specific next steps
```

### Project Kick-Off
```
Summarize the project launch details:
- The overarching Vision
- Specific Targets/KPIs
- Assigned Resources/Teams
- The immediate timeline
```

### Candidate Interview
```
Evaluate the candidate based on the transcript. Summarize:
- Their relevant experience
- Their stated career goals
- Their specific responses to technical or behavioral questions
```

### Retrospective
```
Organize the summary into three categories:
- Start (New processes to implement)
- Stop (Inefficiencies to remove)
- Continue (Successes to double down on)
```

### Stand Up
```
Extract the three standard stand-up components for each participant:
1. What was done yesterday
2. What is being done today
3. Any obstacles or 'blockers' in the way
```

## Custom Profile Examples

### Executive Leadership
**Use Case:** For C-level executives who need high-level business impact

```
Provide a concise executive brief focused on business impact and strategic decisions. Include:
1. Strategic Decisions: What decisions were made and their business rationale
2. Financial Impact: Any budget, revenue, or cost implications mentioned
3. Key Risks: Risks or concerns identified during the discussion
4. Timeline: Critical dates and deadlines established
5. Stakeholders: Key people/teams involved and their roles
6. Next Actions: The top 3-5 action items with owners and dates

Exclude technical implementation details unless they directly impact business outcomes.
```

### Technical Deep Dive
**Use Case:** For engineering teams focused on technical decisions

```
Analyze the technical aspects of the discussion. For each technical topic:
1. Architecture Decisions: What architectural choices were discussed and why
2. Technology Stack: Specific frameworks, libraries, languages, or tools mentioned
3. Implementation Approach: The approach or patterns that will be used
4. Technical Risks: Performance concerns, scalability issues, or other technical risks
5. Trade-offs: Any trade-offs discussed (speed vs. maintainability, etc.)
6. Dependencies: External systems or services that will be needed

Format as sections with bullet points. Use technical terminology appropriately.
```

### Sales Pipeline Status
**Use Case:** For sales managers tracking deal progress

```
Create a deal status report for each prospect mentioned:
1. Company & Contact: Who we were talking to
2. Deal Stage: What stage is this deal in (discovery, demo, negotiation, close, etc.)
3. Deal Size: Budget, contract value, or expected revenue (if mentioned)
4. Key Topics: What was discussed
5. Next Steps: What happens next and by when
6. Risk Factors: Any concerns or potential blockers
7. Confidence Level: Based on conversation, how confident are we in moving forward?

Format as a table with rows per prospect mentioned.
```

### Customer Health Score
**Use Case:** For customer success tracking

```
Assess and report on customer health across multiple dimensions:
1. Product Adoption: How well are they using the product?
2. User Activity: Are they active or dormant?
3. Support Interactions: How many support tickets? What type?
4. Satisfaction Signals: Did they express satisfaction or frustration?
5. Expansion Opportunities: What could they expand/upgrade?
6. Churn Risk: Are there any signals of potential churn?
7. Recommended Actions: What should the CSM do next?

Assign an overall health score (1-5 with 5 being highest health).
```

### Risk & Opportunity Assessment
**Use Case:** For product/business planning

```
Identify and assess business risks and opportunities:
1. Risks Identified: What could go wrong? What are the potential impacts?
2. Market Threats: Competitive or market-based threats mentioned
3. Growth Opportunities: What could accelerate growth?
4. Customer Needs Unmet: What customer problems aren't being solved?
5. Process Improvements: What internal processes could be improved?
6. Market Trends: Any industry trends or directions discussed?

For each item, estimate: Likelihood (high/medium/low), Impact (high/medium/low), Timeframe.
```

### Competitive Intelligence
**Use Case:** For product/marketing research

```
Extract competitive and market intelligence from the discussion:
1. Competitors Mentioned: What competitors came up?
2. Their Strengths: What are competitors doing well?
3. Their Weaknesses: Where are they falling short?
4. Our Competitive Advantages: What makes us different/better?
5. Pricing Benchmarks: What are competitors charging?
6. Feature Gaps: What features are customers asking for that competitors have?
7. Market Positioning: How are we positioned vs. alternatives?

Be factual and objective. Don't make unsupported claims.
```

### User Research Summary
**Use Case:** For product development teams

```
Summarize user feedback and insights from the discussion:
1. User Personas: What user types/personas came up?
2. Pain Points: What problems do users experience?
3. Current Workflow: How do users currently solve this?
4. Feature Requests: What features did they ask for?
5. Usage Patterns: How do they use the product?
6. Barriers to Adoption: What prevents them from using our product?
7. Success Metrics: How would they measure success?

Organize by persona and include specific quotes where relevant.
```

## Writing Your Own Custom Prompt

### Guidelines

1. **Be Specific**
   - Instead of: "Summarize the meeting"
   - Use: "Extract all technical architecture decisions, the rationale for each, and the trade-offs considered"

2. **Define Structure**
   - Specify how you want information organized (bullet points, sections, tables, etc.)
   - Example: "Organize findings into: Overview, Key Metrics, Risks, Next Steps, each with 3-5 bullet points"

3. **Set Boundaries**
   - Tell the AI what to EXCLUDE
   - Example: "Focus only on product strategy; ignore pricing discussions"

4. **Include Tone/Style**
   - Specify the appropriate tone for the audience
   - Example: "Use a technical but accessible tone suitable for product managers"

5. **Define Format**
   - Be explicit about formatting
   - Example: "Use markdown with h2 headers for each section"

### Template for Custom Prompts

```
[Role/Context]: Summarize this meeting from the perspective of a [role]

[Key Elements]: Focus on identifying/extracting:
1. [Element 1]: [What to look for]
2. [Element 2]: [What to look for]
3. [Element 3]: [What to look for]

[Structure]: Organize the summary into:
- [Section 1]: [What goes here]
- [Section 2]: [What goes here]
- [Section 3]: [What goes here]

[Tone/Style]: Use a [tone] tone suitable for [audience]

[Inclusions/Exclusions]: 
- Include: [What to include]
- Exclude: [What to exclude]

[Formatting]: Format as [markdown/table/outline/etc] with [specific requirements]
```

### Example Using Template

```
Role: Product strategist evaluating market fit

Key Elements: Focus on identifying and extracting:
1. Target Customers: Who we're selling to and their pain points
2. Market Size: How big is this market and growing potential
3. Competition: Who are we competing against and how we differentiate
4. Go-to-Market: How we'll reach and sell to customers
5. Metrics: How we'll measure success

Structure: Organize the summary into:
- Executive Summary (2-3 sentences max)
- Target Market: Customer segment, pain points, size potential
- Competitive Landscape: Competitors identified, our differentiation
- Go-to-Market Strategy: How we'll reach customers, pricing approach
- Success Metrics: KPIs we'll track
- Risks & Concerns: Potential blockers identified

Tone: Use a strategic, forward-thinking tone suitable for board members and investors

Inclusions: Company/market data, strategic decisions, timeline commitments
Exclusions: Detailed product specs, internal process discussions, salary/personal info

Formatting: Use markdown with h2 headers, bullet points for each section, bold key metrics
```

## Testing Your Prompt

After creating a custom prompt:

1. **Save it** to your custom profile
2. **Select it** from the dropdown
3. **Generate** a summary from an existing meeting
4. **Review** the output
5. **Refine** the prompt based on results
6. **Update** the profile if needed

### Questions to Ask

- ✅ Does it focus on the right information?
- ✅ Is it organized the way I want?
- ✅ Does it exclude irrelevant details?
- ✅ Is the tone appropriate for my audience?
- ✅ Would I use this summary in my actual work?

If any answer is "no", refine your prompt and try again!


# English Anti-AI Patterns

Based on humanizer skill (29 patterns, Wikipedia WikiProject AI Cleanup) and content-deai-engine (4-step rewrite + 3-role review), adapted for English AI tool review content.

---

## Part A: AI Pattern Diagnosis

### High-Frequency AI Vocabulary (avoid these)

**Overused words**:
actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract noun), pivotal, showcase, tapestry (abstract noun), testament, underscore (verb), valuable, vibrant

**What to use instead**:
- "crucial" → don't say it's crucial, say *why* it matters
- "enhance" → "makes X faster" / "improves X by Y%"
- "key (feature)" → just describe the feature
- "landscape" → "market" / "space" / "category"

### Structural AI Patterns

**1. Outline-like structure**
- "First... Second... Finally..." — delete, just list
- "In conclusion" / "To sum up" — delete, last sentence is enough

**2. Significance inflation**
- "marks a pivotal moment" / "represents a major shift" / "underscores the importance"
- Rewrite: just say what it does, let the reader decide if it's significant.

**3. Fake balance**
- "On one hand... on the other hand..." without taking a side
- Rewrite: pick a side and defend it.

**4. Vague attributions**
- "Industry observers note..." / "Experts argue..." / "Many users report..."
- Rewrite: cite specific Reddit threads, reviews, or "in our testing..."

**5. Elegant variation (synonym cycling)**
- Referring to the same tool as "the platform," "the service," "the solution," "the offering"
- Rewrite: use the tool name or "it."

**6. Em dashes everywhere**
- AI overuses — like this — constantly.
- Rewrite: use commas, periods, or restructure.

**7. Boldface abuse**
- **Every other sentence** has **bolded terms** that don't need emphasis.
- Rewrite: bold only product names on first mention, nothing else.

**8. Generic positive conclusions**
- "The future looks bright" / "Exciting times ahead" / "A step in the right direction"
- Delete. End with a concrete takeaway or action.

**9. Filler phrases**
| Before | After |
|--------|-------|
| "In order to" | "To" |
| "Due to the fact that" | "Because" |
| "It is important to note that" | (delete it, just say the thing) |
| "The system has the ability to" | "It can" |

**10. Announcements not content**
- "Let's dive in" / "Here's what you need to know" / "Without further ado"
- Delete. Start with the actual content.

**11. Knowledge-cutoff hedging**
- "While specific details are limited..." / "Based on available information..."
- Just state what you know. If uncertain, say "we haven't tested this yet."

**12. Collaborative artifacts**
- "I hope this helps!" / "Let me know if you'd like..." / "Certainly! Great question!"
- These are chatbot phrases, not article content.

---

## Part B: 4-Step Rewrite

Apply after initial draft. Must follow this order.

### Step 1: De-template
- Delete mechanical connectors (first/second/finally, in conclusion)
- Delete significance inflation
- Replace vague attributions with specifics
- Fix elegant variation (one name per tool)

### Step 2: Add Details
Inject at least 2 specific details per major section:
- Real numbers: "processed in ~45 seconds on our test image"
- Real scenarios: "if you're editing wedding photos with 200+ shots"
- Costs: "$22/month, which works out to ~$0.02 per generated minute"
- First-person experience: "in our testing, the face detection missed side profiles"

### Step 3: Take a Stand
Every section that compares or evaluates must have an opinion:
- "We recommend X for most people because..."
- "Skip Y if you're on a budget — it's good but not $30/month good"
- "Honestly, the difference between these two is marginal"

No fence-sitting. If there's no meaningful difference, say so. That's also a stand.

### Step 4: Give an Action
End major sections with something the reader can do:
- "Try the free tier first — 10 credits is enough to test 3-4 images"
- "If you're already paying for Photoshop, stick with Firefly"
- "Check the pricing page before committing — they change plans often"

---

## Part C: Personality Injection

### Have Opinions
```
❌ "Both tools have strengths and weaknesses."
✅ "DeepSwapper is better at the actual face swap. Reface is more fun. Pick your priority."
```

### Vary Rhythm
Mix short and long sentences. Read it aloud — if it sounds like a robot reading a textbook, rewrite it.

### Use "We" and "You"
```
❌ "Users may find the interface intuitive."
✅ "We found the interface intuitive. You'll probably pick it up in 5 minutes."
```

### Acknowledge Limits
```
❌ "This tool is excellent for face swapping."
✅ "This tool is excellent for face swapping — as long as you're swapping front-facing portraits. Side profiles still trip it up."
```

### Be Specific About Feelings
```
❌ "The pricing is concerning."
✅ "The pricing honestly made us do a double-take. $299 for what competitors give you at $10/month."
```

---

## Part D: Self-Audit

After the rewrite, ask: **"What makes this obviously AI-generated?"**

Red flags to scan for:
- [ ] Three sentences in a row with the same structure
- [ ] Every paragraph has exactly 3 sentences
- [ ] No opinions — just neutral reporting
- [ ] None of the 12 structural patterns from Part A remain
- [ ] Would a real person actually talk like this?

If you find any red flags → rewrite the section. Then ask again.

---

## Quick Reference: AI Slop → Human

| AI Slop | Human Replacement |
|---------|-------------------|
| "In the rapidly evolving landscape of..." | "AI tools change fast. Here's what matters now." |
| "It serves as a testament to..." | "This shows that..." |
| "Industry observers have noted..." | "We tested it and..." or specific citation |
| "Additionally, it is worth noting that..." | Delete entirely |
| "The platform boasts a comprehensive suite of..." | "It has..." |
| "Let's dive in and explore..." | Start with the actual first sentence |
| "The future of X looks bright" | "We'll update this review when the next version ships" |

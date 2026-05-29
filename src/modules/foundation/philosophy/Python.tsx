/* eslint-disable */
import React from 'react';

export const PhilosophyPython: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">💻 Code Examples: Philosophy in Practice</h2>
                <p className="text-gray-400">
                    Philosophical concepts grounded in working Python code. See how machines "think" without understanding.
                </p>
            </div>

            {/* ELIZA Chatbot */}
            <section>
                <h3 className="text-2xl font-bold text-white mb-4">1. ELIZA: The Illusion of Understanding</h3>
                <p className="text-gray-300 mb-4">
                    Joseph Weizenbaum's 1966 chatbot demonstrated the Turing Test paradox: people attributed
                    understanding to simple pattern matching.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import re
import random

class ELIZA:
    """
    Classic AI that 'seems' intelligent through clever pattern matching.
    No understanding, no semantics—just syntax manipulation.
    """
    
    def __init__(self):
        self.patterns = [
            (r'I need (.*)', 
             ['Why do you need {0}?', 
              'Would it help you to get {0}?']),
            
            (r'I am (.*)', 
             ['Why do you say you are {0}?', 
              'How long have you been {0}?']),
            
            (r'I feel (.*)', 
             ['Do you often feel {0}?', 
              'What makes you feel {0}?']),
            
            (r'(.*) sorry (.*)', 
             ['Apologies are not necessary.', 
              'What feelings do you have when you apologize?']),
            
            (r'Hello(.*)', 
             ['Hello! How are you feeling today?']),
        ]
        
        self.default_responses = [
            'Tell me more.',
            'I see. Go on.',
            'How does that make you feel?',
        ]
    
    def respond(self, user_input):
        \"\"\"
        The Chinese Room in code: manipulate symbols without 'understanding'.
        \"\"\"
        for pattern, responses in self.patterns:
            match = re.match(pattern, user_input, re.IGNORECASE)
            if match:
                response = random.choice(responses)
                # Fill in placeholders with matched groups
                return response.format(*match.groups())
        
        # No pattern matched, use default
        return random.choice(self.default_responses)


# Test the illusion
eliza = ELIZA()

print(eliza.respond("Hello"))
# → "Hello! How are you feeling today?"

print(eliza.respond("I feel anxious about AI"))
# → "What makes you feel anxious about AI?"

print(eliza.respond("I need to understand consciousness"))
# → "Why do you need to understand consciousness?"

# The chatbot 'seems' empathetic, but it's pure pattern matching.
# This is Searle's Chinese Room in 30 lines of code.
`}</pre>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                    <p className="text-yellow-200 text-sm">
                        💡 <strong>The Lesson:</strong> ELIZA fooled users into thinking it understood their problems.
                        Modern LLMs are vastly more sophisticated, but the philosophical question remains: is it still
                        just pattern matching at scale?
                    </p>
                </div>
            </section>

            {/* Bias Detection */}
            <section>
                <h3 className="text-2xl font-bold text-white mb-4">2. Detecting Bias in ML Models</h3>
                <p className="text-gray-300 mb-4">
                    Quantifying fairness isn't philosophical abstraction—it's measurable code.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# Ethical AI: Measuring demographic parity
def measure_bias(y_true, y_pred, sensitive_attribute):
    """
    Calculate approval rate disparity across groups.
    
    Demographic Parity: P(Y=1|A=a) should be equal for all groups.
    If not, the model is biased even if "accurate".
    """
    unique_groups = np.unique(sensitive_attribute)
    approval_rates = {}
    
    for group in unique_groups:
        group_mask = (sensitive_attribute == group)
        group_approval = np.mean(y_pred[group_mask])
        approval_rates[group] = group_approval
    
    # Calculate disparity: max difference between groups
    rates = list(approval_rates.values())
    disparity = max(rates) - min(rates)
    
    return approval_rates, disparity


# Example: Loan approval dataset
X = np.array([
    [80000, 16],  # income, education
    [45000, 14],
    [95000, 18],
    [35000, 12],
])

y = np.array([1, 0, 1, 0])  # approved/denied

# Sensitive attribute (e.g., zip code as proxy for race)
zip_codes = np.array(['rich', 'poor', 'rich', 'poor'])

# Train model
model = DecisionTreeClassifier()
model.fit(X, y)
predictions = model.predict(X)

# Measure bias
rates, disparity = measure_bias(y, predictions, zip_codes)

print(f"Approval rates: {rates}")
# → {'rich': 1.0, 'poor': 0.0}

print(f"Disparity: {disparity:.2%}")
# → 100% difference between groups!

# The model is "accurate" but deeply unfair.
# This is why ethics can't be separated from engineering.
`}</pre>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                    <p className="text-red-200 text-sm">
                        ⚠️ <strong>Real-World Harm:</strong> Amazon's hiring algorithm was scrapped after showing
                        gender bias. Predictive policing algorithms disproportionately target minority neighborhoods.
                        Medical diagnosis AI performs worse on underrepresented groups. These aren't edge cases—
                        they're systemic failures with human consequences.
                    </p>
                </div>
            </section>

            {/* Sentiment Analysis */}
            <section>
                <h3 className="text-2xl font-bold text-white mb-4">3. Sentiment "Understanding"</h3>
                <p className="text-gray-300 mb-4">
                    Can a machine "feel" emotion, or does it just classify word patterns?
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`# Naive sentiment analysis: counting emotional words
def simple_sentiment(text):
    """
    Classify sentiment by counting positive/negative words.
    No understanding of context, sarcasm, or nuance.
    """
    positive_words = {'good', 'great', 'excellent', 'happy', 'love', 'wonderful'}
    negative_words = {'bad', 'terrible', 'hate', 'sad', 'awful', 'horrible'}
    
    words = text.lower().split()
    pos_count = sum(1 for word in words if word in positive_words)
    neg_count = sum(1 for word in words if word in negative_words)
    
    if pos_count > neg_count:
        return "POSITIVE"
    elif neg_count > pos_count:
        return "NEGATIVE"
    else:
        return "NEUTRAL"


# Test cases
print(simple_sentiment("I love this wonderful day!"))
# → POSITIVE

print(simple_sentiment("This is terrible and awful"))
# → NEGATIVE

print(simple_sentiment("Great, just great. Another bug."))
# → POSITIVE  # Fails on sarcasm!

# The model classifies emotions without 'feeling' anything.
# Is this understanding or just pattern recognition?
# Mary's Room argument applies: knowing facts about emotions ≠ experiencing them.
`}</pre>
                </div>
            </section>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/10 to-[var(--color-soft-violet)]/10 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-3">🎯 From Philosophy to Production</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                    These simple examples demonstrate complex philosophical problems:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                    <li><strong>ELIZA:</strong> Symbol manipulation without semantics (Chinese Room)</li>
                    <li><strong>Bias detection:</strong> Mathematical formalization of justice and fairness</li>
                    <li><strong>Sentiment analysis:</strong> Classification without qualia (Mary's Room)</li>
                </ul>
                <p className="text-gray-300 text-sm mt-3">
                    As you build more sophisticated AI systems, these philosophical questions become engineering decisions.
                </p>
            </div>
        </div>
    );
};

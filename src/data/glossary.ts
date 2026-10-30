/**
 * Glossary of key AI/ML terms. Seeded from `src/data/learning_content.json`
 * (which previously shipped a glossary that was never wired into any UI) and
 * extended with a few terms the modules lean on.
 *
 * Use the <Term word="Adam" /> tooltip component from `src/components/Term.tsx`
 * to surface these definitions inline inside theory pages.
 */
export interface GlossaryEntry {
    term: string;
    definition: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {};

function define(term: string, definition: string) {
    GLOSSARY[term.toLowerCase()] = { term, definition };
}

define('Softmax', 'A function that turns a vector of numbers into probabilities that sum to 1.');
define('ReLU', 'Activation function f(x) = max(0, x). It introduces non-linearity and solves the vanishing gradient problem.');
define('Cross-Entropy Loss', 'Measures the difference between two probability distributions (predicted vs. actual).');
define('Epoch', 'One complete pass of the entire training dataset through the neural network.');
define('Batch Size', 'The number of training examples used in one iteration to update the model weights.');
define('Learning Rate', 'A hyperparameter that controls how much to change the model in response to the estimated error each time the model weights are updated.');
define('Overfitting', "When a model learns the training data too well, capturing noise instead of the underlying pattern, leading to poor performance on new data.");
define('Dropout', 'Regularization technique where randomly selected neurons are ignored during training to prevent overfitting.');
define('Tensors', 'Multi-dimensional arrays that are the fundamental data structure in deep learning (Scalar=0D, Vector=1D, Matrix=2D, Tensor=nD).');
define('Convolution', 'A mathematical operation where a kernel (filter) slides over an input (image) to extract features like edges or textures.');
define('Gradient', 'The vector of partial derivatives of a loss function. It points in the direction of steepest ascent, so gradient descent moves opposite to it.');
define('Gradient Descent', 'Iterative optimization that steps the parameters against the gradient: θ ← θ − α∇L. Lower learning rates give smaller, safer steps.');
define('Backpropagation', 'The algorithm that computes all gradients in a neural network efficiently by applying the chain rule backwards from the loss.');
define('Autograd', 'Automatic differentiation: frameworks like PyTorch build a computational graph and apply reverse-mode differentiation for you.');
define('Bias-Variance Tradeoff', 'The balance between a model being too simple to fit the signal (bias) and too sensitive to the training sample (variance).');
define('Adam', 'Adaptive Moment Estimation — an optimizer combining momentum with per-parameter adaptive learning rates. The most common default.');
define('Eigenvalue', 'The scaling factor a matrix applies to one of its eigenvectors — i.e. the variance captured along that natural axis of the data.');
define('Eigenvector', 'A direction that a matrix only stretches (or shrinks), never rotates. Eigendecomposition reveals the natural axes of a dataset.');
define('Q-Learning', 'An off-policy temporal-difference control algorithm that updates Q(s,a) toward the max Q of the next state.');
define('Policy', "An agent's strategy: a mapping from states to actions (or to a distribution over actions).");
define('Bellman Equation', 'The recursive identity that decomposes the value of a state into immediate reward plus discounted value of the successor state.');
define('Temperature', 'A sampling hyperparameter for LLMs that sharpens (low) or flattens (high) the next-token probability distribution.');
define('Attention', 'The mechanism that lets a model weigh the relevance of every token against every other token, forming context-dependent representations.');
define('Token', 'The atomic unit of text after tokenization: a word, sub-word, or character that a language model actually processes.');

/** Look up a glossary entry case-insensitively; returns undefined when absent. */
export function lookupTerm(word: string): GlossaryEntry | undefined {
    return GLOSSARY[word.toLowerCase().replace(/\s+$/, '')];
}

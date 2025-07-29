/**
 * Create a natural user query with embedded RAG context
 * This matches the SFT format: <|user|>{prompt}<|assistant|>
 */
function createFullPrompt(userQuery, context = '') {
  if (context && context.trim()) {
    // Embed context naturally within a user question
    return `I'm looking for information about Kristian Fischer. Here's what I know about him:

${context.trim()}

Based on this information: ${userQuery}`;
  } else {
    // Fallback to direct query when no context available
    return `Tell me about Kristian Fischer: ${userQuery}`;
  }
}

function getEstimatedTokenCount(context = '') {
  // Estimate tokens for the full prompt
  const baseTokens = 50; // Base wrapper text
  const contextTokens = Math.ceil(context.length / 4);
  const queryTokens = 20; // Approximate for typical query
  return baseTokens + contextTokens + queryTokens;
}

export {
  createFullPrompt,
  getEstimatedTokenCount
}; 
import type { Product, Language } from './types'

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Calculate similarity score (0-1, higher is better)
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1 - distance / maxLen
}

// Check if query is contained in text (partial match)
function containsMatch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase())
}

interface SearchResult {
  product: Product
  score: number
  matchedField: string
}

export function fuzzySearchProducts(
  products: Product[],
  query: string,
  lang: Language,
  threshold: number = 0.3
): Product[] {
  if (!query.trim()) return products

  const queryLower = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const product of products) {
    let bestScore = 0
    let matchedField = ''

    // Check product name
    const name = product.name[lang].toLowerCase()
    if (containsMatch(name, queryLower)) {
      bestScore = Math.max(bestScore, 0.9)
      matchedField = 'name'
    } else {
      const nameScore = similarity(name, queryLower)
      if (nameScore > bestScore) {
        bestScore = nameScore
        matchedField = 'name'
      }
      // Check individual words in name
      const nameWords = name.split(/\s+/)
      for (const word of nameWords) {
        const wordScore = similarity(word, queryLower)
        if (wordScore > bestScore) {
          bestScore = wordScore
          matchedField = 'name'
        }
      }
    }

    // Check category
    const category = product.category.toLowerCase()
    if (containsMatch(category, queryLower)) {
      bestScore = Math.max(bestScore, 0.85)
      matchedField = 'category'
    } else {
      const categoryScore = similarity(category, queryLower)
      if (categoryScore > bestScore) {
        bestScore = categoryScore
        matchedField = 'category'
      }
    }

    // Check description
    const description = product.description[lang].toLowerCase()
    if (containsMatch(description, queryLower)) {
      if (bestScore < 0.7) {
        bestScore = 0.7
        matchedField = 'description'
      }
    }

    // Check features
    for (const feature of product.features[lang]) {
      const featureLower = feature.toLowerCase()
      if (containsMatch(featureLower, queryLower)) {
        if (bestScore < 0.65) {
          bestScore = 0.65
          matchedField = 'features'
        }
        break
      }
      const featureScore = similarity(featureLower, queryLower)
      if (featureScore > threshold && featureScore > bestScore) {
        bestScore = featureScore
        matchedField = 'features'
      }
    }

    // Check specs
    for (const [, value] of Object.entries(product.specs)) {
      if (value) {
        const valueLower = value.toLowerCase()
        if (containsMatch(valueLower, queryLower)) {
          if (bestScore < 0.6) {
            bestScore = 0.6
            matchedField = 'specs'
          }
          break
        }
      }
    }

    if (bestScore >= threshold) {
      results.push({ product, score: bestScore, matchedField })
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score)

  return results.map((r) => r.product)
}

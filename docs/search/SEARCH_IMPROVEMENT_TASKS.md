# Search Improvement Task List

## Overview
Enhance product search to intelligently handle variant-based queries like "red dress size small" with typo tolerance and fuzzy matching.

## Current State Analysis
- ✅ Basic search: name, tags, description
- ❌ No variant search (size, color, material)
- ❌ No typo tolerance
- ❌ No intelligent query parsing
- ❌ No relevance scoring

## Target State
- ✅ Search variants (size, color, material)
- ✅ Typo tolerance (fuzzy matching)
- ✅ Intelligent query parsing ("red dress size small" → color=red, size=small)
- ✅ Relevance scoring
- ✅ Multi-field search with weights

---

## Phase 1: Foundation & Analysis (2-3 days)

### Task 1.1: Analyze Current Search Implementation
**Priority**: P0  
**Effort**: 2 hours  
**Description**: 
- Review current search query structure in `src/modules/products/server/procedures.ts`
- Document current limitations
- Identify database indexes on searchable fields
- Check MongoDB query performance

**Acceptance Criteria**:
- [ ] Document current search behavior
- [ ] List all searchable fields
- [ ] Identify performance bottlenecks
- [ ] Document variant data structure

**Files to Review**:
- `src/modules/products/server/procedures.ts`
- `src/collections/Products.ts`
- Database schema/indexes

---

### Task 1.2: Design Search Architecture
**Priority**: P0  
**Effort**: 4 hours  
**Description**:
Design the enhanced search system architecture:
- Query parsing strategy
- Variant matching approach
- Fuzzy matching algorithm selection
- Relevance scoring model
- Performance optimization strategy

**Acceptance Criteria**:
- [ ] Architecture diagram created
- [ ] Algorithm selection documented (Levenshtein, Jaro-Winkler, etc.)
- [ ] Performance targets defined (< 200ms response time)
- [ ] Scalability plan documented

**Deliverables**:
- `docs/SEARCH_ARCHITECTURE.md`

---

### Task 1.3: Create Variant Search Utilities
**Priority**: P0  
**Effort**: 6 hours  
**Description**:
Create utility functions for variant search:
- Extract variant values from products
- Normalize variant values (size: "S" = "small", "Small")
- Map variant types to search terms
- Build variant search queries

**Acceptance Criteria**:
- [ ] Function to extract all variant values from product
- [ ] Function to normalize variant values
- [ ] Function to match search terms to variant types
- [ ] Unit tests with >80% coverage

**Files to Create**:
- `src/lib/search/variant-utils.ts`
- `src/test/lib/search/variant-utils.test.ts`

**Example**:
```typescript
extractVariantValues(product) → "small red silk"
normalizeVariantValue("S") → "small"
matchVariantType("red") → { type: "color", value: "red" }
```

---

## Phase 2: Query Parsing & Intelligence (3-4 days)

### Task 2.1: Implement Query Parser
**Priority**: P0  
**Effort**: 8 hours  
**Description**:
Build intelligent query parser that extracts:
- Variant values (size, color, material)
- Product type keywords (dress, saree, lehenga)
- General search terms

**Acceptance Criteria**:
- [ ] Parse "red dress size small" → { color: "red", size: "small", type: "dress", terms: [] }
- [ ] Handle multiple variants: "small red silk"
- [ ] Handle partial queries: "red small"
- [ ] Unit tests for all parsing scenarios

**Files to Create**:
- `src/lib/search/query-parser.ts`
- `src/test/lib/search/query-parser.test.ts`

**Example Queries**:
- "red dress size small" → { color: "red", size: "small", keywords: ["dress"] }
- "small red silk" → { size: "small", color: "red", material: "silk" }
- "maroon lehenga" → { color: "maroon", keywords: ["lehenga"] }

---

### Task 2.2: Create Variant Type Mapper
**Priority**: P0  
**Effort**: 4 hours  
**Description**:
Map search terms to variant types:
- Color terms → "color" variant type
- Size terms → "size" variant type
- Material terms → "material" variant type

**Acceptance Criteria**:
- [ ] Map common color names to variant values
- [ ] Map size abbreviations (S, M, L) to full names
- [ ] Map material synonyms
- [ ] Handle case-insensitive matching

**Files to Create**:
- `src/lib/search/variant-mapper.ts`
- `src/test/lib/search/variant-mapper.test.ts`

**Mappings**:
```typescript
{
  colors: ["red", "blue", "green", "maroon", "crimson", ...],
  sizes: { "s": "small", "m": "medium", "l": "large", ... },
  materials: ["silk", "cotton", "georgette", ...]
}
```

---

### Task 2.3: Implement Synonym Expansion
**Priority**: P1  
**Effort**: 4 hours  
**Description**:
Expand search terms with synonyms:
- "maroon" → ["red", "burgundy", "crimson"]
- "gown" → ["dress", "frock"]
- "sari" → ["saree"]

**Acceptance Criteria**:
- [ ] Synonym dictionary for colors, sizes, materials, garment types
- [ ] Expand search terms automatically
- [ ] Handle multiple synonym levels
- [ ] Unit tests for synonym expansion

**Files to Create**:
- `src/lib/search/synonyms.ts`
- `src/test/lib/search/synonyms.test.ts`

---

## Phase 3: Fuzzy Matching & Typo Tolerance (2-3 days)

### Task 3.1: Implement Fuzzy Matching Algorithm
**Priority**: P0  
**Effort**: 6 hours  
**Description**:
Implement fuzzy matching for typo tolerance:
- Levenshtein distance for string similarity
- Configurable similarity threshold (default: 0.8)
- Handle common typos (smal → small, redd → red)

**Acceptance Criteria**:
- [ ] Calculate string similarity (0-1 scale)
- [ ] Match "smal" to "small" (similarity > 0.8)
- [ ] Match "redd" to "red" (similarity > 0.8)
- [ ] Performance: < 10ms per comparison
- [ ] Unit tests with various typo scenarios

**Files to Create**:
- `src/lib/search/fuzzy-matcher.ts`
- `src/test/lib/search/fuzzy-matcher.test.ts`

**Algorithm Options**:
- Levenshtein Distance (simple, fast)
- Jaro-Winkler (better for short strings)
- Damerau-Levenshtein (handles transpositions)

---

### Task 3.2: Create Typo Correction Dictionary
**Priority**: P1  
**Effort**: 3 hours  
**Description**:
Build dictionary of common typos for fashion terms:
- Common misspellings
- Phonetic variations
- Abbreviation expansions

**Acceptance Criteria**:
- [ ] Dictionary of 50+ common typos
- [ ] Handle phonetic matches ("saree" vs "sari")
- [ ] Handle abbreviation expansions ("sm" → "small")
- [ ] Unit tests for typo correction

**Files to Create**:
- `src/lib/search/typo-dictionary.ts`

**Examples**:
```typescript
{
  "smal": "small",
  "redd": "red",
  "saree": "sari",
  "silk": "silk", // handles "silck", "silk"
  ...
}
```

---

### Task 3.3: Implement Fuzzy Variant Matching
**Priority**: P0  
**Effort**: 6 hours  
**Description**:
Match search terms to variant values with fuzzy matching:
- "smal" matches "small" in variants
- "redd" matches "red" in variants
- "silck" matches "silk" in variants

**Acceptance Criteria**:
- [ ] Fuzzy match variant values
- [ ] Return similarity score
- [ ] Handle multiple variant types
- [ ] Performance: < 50ms for 100 variants
- [ ] Unit tests with typos

**Files to Create**:
- `src/lib/search/fuzzy-variant-matcher.ts`
- `src/test/lib/search/fuzzy-variant-matcher.test.ts`

---

## Phase 4: Search Implementation (4-5 days)

### Task 4.1: Enhance Search Query Builder
**Priority**: P0  
**Effort**: 8 hours  
**Description**:
Build MongoDB query that includes:
- Name/tag/description search (existing)
- Variant search (new)
- Fuzzy matching support
- Combined OR/AND logic

**Acceptance Criteria**:
- [ ] Search name, tags, description (existing)
- [ ] Search variant data (new)
- [ ] Combine variant filters with AND logic
- [ ] Combine general search with OR logic
- [ ] Handle empty/null variants gracefully

**Files to Modify**:
- `src/modules/products/server/procedures.ts`

**Query Structure**:
```typescript
{
  or: [
    { name: { contains: "dress" } },
    { "tags.name": { contains: "dress" } },
    { description: { contains: "dress" } }
  ],
  and: [
    { "variants.variantData.color": { in: ["red", "maroon"] } },
    { "variants.variantData.size": { in: ["small", "s"] } }
  ]
}
```

---

### Task 4.2: Implement Variant Search in getMany
**Priority**: P0  
**Effort**: 6 hours  
**Description**:
Integrate variant search into `products.getMany` procedure:
- Parse query for variant terms
- Build variant search conditions
- Combine with existing search
- Handle fuzzy matching

**Acceptance Criteria**:
- [ ] "red dress size small" finds products with red color and small size
- [ ] "small red silk" finds products with small size, red color, silk material
- [ ] Handles typos: "smal red" still works
- [ ] Performance: < 200ms for typical queries
- [ ] Integration tests

**Files to Modify**:
- `src/modules/products/server/procedures.ts`

---

### Task 4.3: Implement Post-Query Filtering (Fallback)
**Priority**: P1  
**Effort**: 4 hours  
**Description**:
If MongoDB variant search doesn't work well, implement post-query filtering:
- Fetch products with general search
- Filter in-memory by variant matches
- Apply fuzzy matching
- Sort by relevance

**Acceptance Criteria**:
- [ ] Fallback when MongoDB query is insufficient
- [ ] In-memory variant matching
- [ ] Fuzzy matching support
- [ ] Performance: acceptable for < 1000 products
- [ ] Unit tests

**Files to Create**:
- `src/lib/search/post-filter.ts`

---

## Phase 5: Relevance Scoring (2-3 days)

### Task 5.1: Implement Relevance Scoring
**Priority**: P1  
**Effort**: 6 hours  
**Description**:
Score products by relevance:
- Exact matches: highest score
- Variant matches: high score
- Name matches: medium score
- Description matches: lower score
- Fuzzy matches: scaled down

**Acceptance Criteria**:
- [ ] Score calculation function
- [ ] Weighted scoring (name > variants > description)
- [ ] Sort by relevance score
- [ ] Unit tests for scoring logic

**Files to Create**:
- `src/lib/search/relevance-scorer.ts`
- `src/test/lib/search/relevance-scorer.test.ts`

**Scoring Weights**:
```typescript
{
  exactNameMatch: 1.0,
  variantMatch: 0.8,
  nameContains: 0.6,
  tagMatch: 0.5,
  descriptionMatch: 0.4,
  fuzzyMatch: 0.3
}
```

---

### Task 5.2: Sort Results by Relevance
**Priority**: P1  
**Effort**: 3 hours  
**Description**:
Sort search results by relevance score:
- Highest score first
- Fallback to creation date for same score
- Limit results to requested amount

**Acceptance Criteria**:
- [ ] Sort by relevance score (descending)
- [ ] Secondary sort by creation date
- [ ] Respect pagination limits
- [ ] Performance: < 50ms for sorting 1000 products

**Files to Modify**:
- `src/modules/products/server/procedures.ts`

---

## Phase 6: Performance & Optimization (2-3 days)

### Task 6.1: Add Database Indexes
**Priority**: P0  
**Effort**: 3 hours  
**Description**:
Create MongoDB indexes for search performance:
- Text index on name, description
- Index on variant data fields
- Compound indexes for common queries

**Acceptance Criteria**:
- [ ] Text index on `name`
- [ ] Text index on `tags.name`
- [ ] Index on `variants.variantData.*` (if possible)
- [ ] Compound index for category + search
- [ ] Performance improvement: 50%+ faster queries

**Files to Create**:
- `src/collections/Products.ts` (add indexes)
- Migration script if needed

---

### Task 6.2: Optimize Query Performance
**Priority**: P1  
**Effort**: 4 hours  
**Description**:
Optimize search queries:
- Limit initial fetch size
- Use projection to reduce data transfer
- Cache frequent searches
- Optimize fuzzy matching algorithm

**Acceptance Criteria**:
- [ ] Query time < 200ms for typical searches
- [ ] Reduced data transfer (projection)
- [ ] Memory usage < 100MB for 1000 products
- [ ] Performance benchmarks documented

---

### Task 6.3: Add Search Result Caching
**Priority**: P2  
**Effort**: 4 hours  
**Description**:
Cache search results for common queries:
- Cache popular searches (top 100)
- TTL: 5-15 minutes
- Invalidate on product updates
- Redis or in-memory cache

**Acceptance Criteria**:
- [ ] Cache implementation
- [ ] Cache invalidation strategy
- [ ] Cache hit rate > 30% for popular searches
- [ ] Performance: < 50ms for cached queries

**Files to Create**:
- `src/lib/search/cache.ts`

---

## Phase 7: Testing & Quality Assurance (3-4 days)

### Task 7.1: Unit Tests for Search Utilities
**Priority**: P0  
**Effort**: 8 hours  
**Description**:
Write comprehensive unit tests:
- Query parser tests
- Variant matcher tests
- Fuzzy matcher tests
- Relevance scorer tests
- Edge cases and error handling

**Acceptance Criteria**:
- [ ] >80% code coverage
- [ ] All edge cases covered
- [ ] Error handling tested
- [ ] Performance tests included

**Files to Create**:
- `src/test/lib/search/*.test.ts`

---

### Task 7.2: Integration Tests
**Priority**: P0  
**Effort**: 6 hours  
**Description**:
Test end-to-end search functionality:
- Test "red dress size small" query
- Test typo tolerance
- Test variant matching
- Test relevance scoring
- Test performance

**Acceptance Criteria**:
- [ ] Integration tests for all search scenarios
- [ ] Performance benchmarks
- [ ] Edge case handling
- [ ] Error scenarios

**Files to Create**:
- `src/test/integration/search.test.ts`

---

### Task 7.3: E2E Tests for Search
**Priority**: P1  
**Effort**: 4 hours  
**Description**:
End-to-end tests for search UI:
- User searches "red dress size small"
- Verify results show red dresses with small size
- Test typo tolerance in UI
- Test search filters

**Acceptance Criteria**:
- [ ] E2E tests for search flow
- [ ] UI interaction tests
- [ ] Results verification
- [ ] Cross-browser testing

**Files to Modify**:
- `e2e/search-browse.spec.ts`

---

## Phase 8: Documentation & Deployment (1-2 days)

### Task 8.1: Document Search Features
**Priority**: P1  
**Effort**: 3 hours  
**Description**:
Document enhanced search:
- How variant search works
- Typo tolerance features
- Query examples
- Performance characteristics
- API documentation

**Acceptance Criteria**:
- [ ] User-facing documentation
- [ ] Developer documentation
- [ ] API documentation
- [ ] Examples and use cases

**Files to Create**:
- `docs/SEARCH_FEATURES.md`
- Update API docs

---

### Task 8.2: Performance Monitoring
**Priority**: P1  
**Effort**: 2 hours  
**Description**:
Add monitoring for search:
- Query performance metrics
- Search term analytics
- Error tracking
- Cache hit rates

**Acceptance Criteria**:
- [ ] Performance metrics logged
- [ ] Search analytics tracked
- [ ] Error monitoring
- [ ] Dashboard for metrics

---

## Implementation Recommendations

### Approach 1: Simple MongoDB Query (Recommended for MVP)
**Pros**:
- Fast implementation (2-3 days)
- Good performance with indexes
- Native MongoDB support

**Cons**:
- Limited fuzzy matching
- No typo correction
- Basic relevance scoring

**Best For**: Quick implementation, good enough for most cases

### Approach 2: Hybrid (MongoDB + Post-Processing)
**Pros**:
- Better fuzzy matching
- Typo tolerance
- Flexible relevance scoring

**Cons**:
- More complex
- Slower for large datasets
- More memory usage

**Best For**: Better user experience, acceptable performance

### Approach 3: Full-Text Search Engine (Elasticsearch/Meilisearch)
**Pros**:
- Best search quality
- Advanced features
- Excellent performance at scale

**Cons**:
- Additional infrastructure
- More complex setup
- Higher maintenance

**Best For**: Large scale, advanced search needs

---

## Recommended Implementation Order

### MVP (Week 1-2)
1. Task 1.1-1.3: Foundation
2. Task 2.1-2.2: Query parsing
3. Task 4.1-4.2: Basic variant search
4. Task 6.1: Database indexes
5. Task 7.1-7.2: Testing

### Enhanced (Week 3-4)
6. Task 3.1-3.3: Fuzzy matching
7. Task 5.1-5.2: Relevance scoring
8. Task 6.2: Performance optimization
9. Task 7.3: E2E tests
10. Task 8.1: Documentation

### Advanced (Future)
11. Task 2.3: Synonym expansion
12. Task 3.2: Typo dictionary
13. Task 4.3: Post-query filtering
14. Task 6.3: Caching

---

## Success Metrics

- **Search Accuracy**: >90% relevant results for variant queries
- **Typo Tolerance**: >80% success rate for common typos
- **Performance**: <200ms average query time
- **User Satisfaction**: Improved search experience
- **Coverage**: >80% test coverage

---

## Estimated Timeline

- **MVP**: 2 weeks (10-12 days)
- **Enhanced**: 4 weeks (20-24 days)
- **Advanced**: 6 weeks (30-36 days)

---

## Dependencies

- MongoDB indexes
- Variant data structure (already exists)
- Test data with variants
- Performance monitoring tools

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation | High | Add indexes, optimize queries, implement caching |
| Complex variant queries | Medium | Start simple, iterate based on feedback |
| Typo matching false positives | Low | Tune similarity threshold, add whitelist |
| Maintenance overhead | Medium | Good documentation, comprehensive tests |

---

## Next Steps

1. Review this task list
2. Prioritize tasks based on business needs
3. Choose implementation approach (Simple/Hybrid/Full-Text)
4. Start with Phase 1 tasks
5. Iterate based on user feedback

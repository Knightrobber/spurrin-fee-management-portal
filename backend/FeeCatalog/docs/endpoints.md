Endpoints

Fee structures
- POST /fee-structures
  - create a new fee structure
  - required: courseId, batchId, name, terms[] (each term with its component breakdown)
  - 201 Created + Location header

- GET /searches/page — returns the results along with the facets (available filters) and total match count
  - filter[searchTerm] — free-text, partial (case-insensitive) match against fee structure version name
  - filter[courseId] — exact match, single id
  - filter[categoryId] — exact match, single id
  - filter[batchId] — exact match, single id
  - filter[status] — optional version status; defaults to ACTIVE when omitted
  - page[size] — caps the number of results returned (no offset; this endpoint is not offset-paginated)
  - facets (courses, categories, batches) are computed from the search term + status only, so every still-selectable option is returned; the results are then fetched with all filters applied
  - response: data.attributes.facets holds the available filters and totalCount, data.relationships.fee-structures references the results, and included[] carries each fee-structure result (name, courseName, categoryName, batchName, batchYears, createdAt)

- GET /searches/fee-structures — just returns the results (no facets)
  - filter[searchTerm] — free-text, partial (case-insensitive) match against fee structure version name
  - filter[courseId] — exact match, single id
  - filter[categoryId] — exact match, single id
  - filter[batchId] — exact match, single id
  - filter[status] — optional version status; defaults to ACTIVE when omitted
  - page[offset], page[size] — pagination
  - response: data[] array of fee-structure results, ordered by createdAt descending

- GET /fee-structures/:id
  - returns full fee structure detail: all terms, component breakdown, lineageId, version

- POST /fee-structures/:id/versions
  - created a new version of the existing fee strcture version when any of the fields change
  - Payload will be similar to the db model
  - new version is in DRAFT state. It needs to be published for it to become the active version
  - the same schema validation rules apply to updates as creating a new fee strcture
  - 201 Created, returns new version document

- GET /fee-structures/:id/versions/:versionId
 - get the full version data for a version document

- Delete /fee-structures/:id/versions/:id
  - delete the version if the version is in InActive or DRAFT state

- POST /fee-structures/:id/versions/:versionId/publish
  - publishes/Activates a new version of the fee structure
  - deactivates or makes the current active version inActive and activates the new version
  - accepts a versionId and sends back the fee structure version with the updated status 

Categories
- POST /categories
- GET /categories
- GET /categories/:id

Courses
- POST /courses
- GET /courses
- GET /courses/:id

Batches
- POST /batches
- GET /batches
- GET /batches/:id

Addons
- POST /addons
- POST/addons/:id/versions
- GET /addons?filter[name]&filter[isRecurring]
- GET /addons/:id

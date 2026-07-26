Endpoints

Fee structures
- POST /fee-structures
  - create a new fee structure
  - required: courseId, batchId, name, terms[] (each term with its component breakdown)
  - 201 Created + Location header

- GET /fee-structures
  - filter[searchTerm] — free-text, partial match against fee structure name
  - filter[courseId] — exact match, single id
  - filter[batchId] — exact match, single id
  - page[number], page[size] — pagination
  - fields[fee-structures] — optional sparse fieldset for list view

- GET /fee-structures/:id
  - returns full fee structure detail: all terms, component breakdown, lineageId, version

- POST /fee-structures/:id/versions
  - publishes a new version when component breakdown changes
  - courseId and batchId are immutable — reject if present in body and different from current
  - new version linked to previous via lineageId
  - 201 Created, returns new version document

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
- 

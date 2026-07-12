# Fee Catalog — NoSQL Data Model

Fee structures are **per (course, category, batch)**:

- **Course** — the academic program (MBBS, MD-Radiology, BDS…), with its duration in years.
- **Category** — the **quota / seat type** a student is admitted under (Govt/CET, Management, NRI, OBC, SC/ST, EWS, Institutional…). Determines which fee applies; amounts differ sharply by category.
- **Batch** — the **intake cohort** for a course in an admission year (e.g. "MBBS 2026-27"). A new fee structure is created per batch, and the batch's real start/end dates anchor each term's calendar dates.

## Use cases
The fee catalog is owned by **Finance**. Typical actions:

- **Create a fee structure** for a new batch — define its terms, per-term components, one-time costs (marking refundable ones), and late-fee logic.
- **Clone** last year's structure into a new batch, then bump the amounts for the year-on-year increase.
- **Publish a new version** — revise or correct a structure *before its payment window opens*; the edit becomes the new `ACTIVE` version.
- **Search / browse** fee structures by course, category, or batch.
- **View version history** of a structure (all versions in a lineage).
- **Manage add-ons** — create hostel / food / fine / discount add-ons and publish new versions when their amounts change.

## How versioning works
- **Any change to a fee structure creates a new version** — an existing version is never edited.
- All versions of one structure share a **`lineageId`**, which is the `_id` of the **first (root) version**.
- The **latest version has `status: ACTIVE`**; older ones become `SUPERSEDED`.
- A new version must be published **before that structure's payment window opens**. Once the window is open (billing has started) the version is locked — for the next batch, **clone** it into a new lineage instead.

## Collections

### `feeStructures` — one document per version
```json
{
  "_id": "ObjectId",
  "lineageId": "ObjectId",     // _id of the first/root version; ACTIVE = latest
  "version": 1,
  "status": "ACTIVE",          // DRAFT | ACTIVE | SUPERSEDED
  "courseId": "ObjectId",
  "categoryId": "ObjectId",
  "batchId": "ObjectId",
  "terms": [
    {
      "startDate": "ISODate",
      "endDate": "ISODate",
      "components": [
        { "name": "Tuition", "amount": 675000 },
        { "name": "University (RGUHS)", "amount": 12360 }
      ],
      "dueDate": "ISODate",
      "paymentWindowOpenDate": "ISODate"
    }
  ],
  "paymentWindowOffsetDays": 30,
  "dueDateOffsetDays": 30,
  "oneTimeFixedCosts": [
    { "name": "Admission", "amount": 29350, "refundable": false },
    { "name": "Caution Deposit", "amount": 14000, "refundable": true }
  ],
  "lateFeeLogic": { "perDayFine": 1000 }
}
```
Each installment (Jan/July, or Manipal's four) is a `term` with its own `dueDate`. Per-year amount changes (heavier first year, half final year) are just different `terms`. Absolute `dueDate` / `paymentWindowOpenDate` are optional; when omitted they derive from the offsets.

Indexes: `{ courseId, categoryId, batchId, status }` (search) and `{ lineageId, version }` (history).

### `addons` — one document per version
```json
{
  "_id": "ObjectId",
  "lineageId": "ObjectId",
  "version": 1,
  "status": "ACTIVE",
  "name": "Hostel",
  "isRecurring": true,
  "applyMode": "NEXT_TERM",
  "amount": 51040,
  "approvalNeeded": false,
  "approverRole": null
}
```

### `courses`
```json
{ "_id": "ObjectId", "name": "MBBS", "durationYears": 5.5 }
```

### `categories`
```json
{ "_id": "ObjectId", "name": "Management" }
```

### `batches`
```json
{ "_id": "ObjectId", "name": "MBBS 2026-27", "startDate": "ISODate", "endDate": "ISODate" }
```

## Operations
- **Search:** `find({ courseId, categoryId, batchId, status: "ACTIVE" })`.
- **New version:** insert same `lineageId`, `version + 1`, `ACTIVE`; set prior to `SUPERSEDED` (one transaction).
- **Clone (new batch):** copy a doc with a new `lineageId` (= new root `_id`), `version: 1`, new `batchId`.

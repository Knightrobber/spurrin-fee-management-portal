# Fee Catalog — ER Diagram (SQL)

Fee structures are **per (course, category, batch)**:

- **Course** — the academic program a student enrolls in (MBBS, MD-Radiology, BDS…). Also carries its duration in years.
- **Category** — the **quota / seat type** a student is admitted under (Govt/CET, Management, NRI, OBC, SC/ST, EWS, Institutional…). Determines which fee applies; amounts differ sharply by category (e.g. Govt vs Management can be 20×+ apart).
- **Batch** — the **intake cohort** for a course in an admission year (e.g. "MBBS 2026-27"). A new fee structure is created per batch, and the batch's real start/end dates anchor each term's calendar dates.

## Use cases
The fee catalog is owned by **Finance**. Typical actions:

- **Create a fee structure** for a new batch — define its terms, per-term components, one-time costs (marking refundable ones), and late-fee logic.
- **Clone** last year's structure into a new batch, then bump the amounts for the year-on-year increase.
- **Publish a new version** — revise or correct a structure *before its payment window opens*; the edit becomes the new `ACTIVE` version.
- **Search / browse** fee structures by course, category, or batch.
- **View version history** of a structure (all versions in a lineage).
- **Manage add-ons** — create hostel / food / fine / discount add-ons and publish new versions when their amounts change.

## Data model
`fee_structures` holds the stable identity (course, category, batch); everything that changes per version lives in `fee_structure_versions`. Same split for `addons` and `addon_versions`.

```mermaid
erDiagram
    courses                 ||--o{ fee_structures          : course
    categories              ||--o{ fee_structures          : "quota / seat type"
    batches                 ||--o{ fee_structures          : batch
    fee_structures          ||--o{ fee_structure_versions  : versions
    fee_structure_versions  ||--o{ terms                   : contains
    terms                   ||--o{ term_components         : contains
    fee_structure_versions  ||--o{ one_time_costs          : has
    addons                  ||--o{ addon_versions          : versions

    courses {
      bigint id PK
      string name
      float duration_years
    }
    categories {
      bigint id PK
      string name
    }
    batches {
      bigint id PK
      string name
      date start_date
      date end_date
    }
    fee_structures {
      bigint id PK
      bigint course FK
      bigint category FK
      bigint batch FK
    }
    fee_structure_versions {
      bigint id PK
      bigint fee_structure_id FK
      string name       
      string status
      int late_fee_per_day
      int payment_window_offset_days
      int due_date_offset_days
      timestamp created_at
      bigint created_by FK
    }
    terms {
      bigint id PK
      bigint fee_structure_version_id FK
      date start_date
      date end_date
      date due_date
      date payment_window_open_date
    }
    term_components {
      bigint id PK
      bigint term_id FK
      string name
      int amount
    }
    one_time_costs {
      bigint id PK
      bigint fee_structure_version_id FK
      string name
      int amount
    }
    addons {
      bigint id PK
      string name
      bool is_recurring
    }
    addon_versions {
      bigint id PK
      bigint addon_id FK
      int version
      string status
      int amount
      string apply_mode
      bool approval_needed
      string approver_role
      timestamp created_at
      bigint created_by FK
    }
```

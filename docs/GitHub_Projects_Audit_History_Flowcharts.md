# GitHub Projects Audit History — MVP Flowcharts

These diagrams describe the prototype defined in the MVP specification. The product is read-only: it captures and displays Project V2 field changes but does not roll them back.

## 1. System context

```mermaid
flowchart TD
    U[Project user] -->|Changes a field| GH[GitHub Projects]
    GH -->|Signed webhook| APP[Audit prototype]
    APP -->|Raw delivery and normalized event| DB[(PostgreSQL)]
    M[Engineering manager] -->|Views history| APP
    APP -->|Reads current Project state| API[GitHub API]
    API -->|Items and field values| APP
```

## 2. Initial setup and baseline

```mermaid
flowchart TD
    A[Create GitHub App] --> B[Grant Projects read permission]
    B --> C[Install App on test organization]
    C --> D[Configure installation and Project IDs]
    D --> E[Request installation token]
    E --> F[Fetch Project fields and items]
    F --> G[Normalize current values]
    G --> H[(Store baseline state)]
    H --> I[Begin tracking]
```

The baseline represents the Project’s state when tracking begins. It must not be presented as historical user changes.

## 3. Webhook ingestion

```mermaid
flowchart TD
    A[Receive webhook] --> B{Valid signature?}
    B -- No --> C[Return 401]
    B -- Yes --> D{Delivery ID exists?}
    D -- Yes --> E[Return 200 as duplicate]
    D -- No --> F[(Store raw delivery)]
    F --> G{Target event and Project?}
    G -- No --> H[Mark ignored]
    G -- Yes --> I[Normalize field change]
    I --> J{Supported payload?}
    J -- No --> K[Mark failed and retain evidence]
    J -- Yes --> L[Append audit event]
    L --> M[Update current state]
    M --> N[Mark processed]
```

## 4. Atomic event persistence

```mermaid
sequenceDiagram
    participant W as Webhook handler
    participant D as Delivery store
    participant N as Normalizer
    participant T as Database transaction

    W->>D: Insert delivery by unique delivery ID
    alt Duplicate delivery
        D-->>W: Already exists
        W-->>W: Return success without new event
    else New delivery
        D-->>W: Stored
        W->>N: Normalize previous and current values
        N-->>W: Canonical audit event
        W->>T: Begin transaction
        T->>T: Insert append-only audit event
        T->>T: Upsert current field value
        T->>T: Mark delivery processed
        T-->>W: Commit
    end
```

If normalization or persistence fails, the raw delivery remains available for diagnosis and retry. The application must never silently discard it.

## 5. Timeline query

```mermaid
flowchart TD
    A[Manager opens timeline] --> B[Authenticate prototype admin]
    B --> C[Read filter parameters]
    C --> D[Query audit events]
    D --> E[Join item and field metadata]
    E --> F[Render before and after values]
    F --> G[Display newest-first timeline]
    G --> H{More events?}
    H -- Yes --> I[Load next page]
    H -- No --> J[End]
```

Supported filters:

- Actor
- Item title or number
- Field
- Date range

## 6. Reconciliation

```mermaid
flowchart TD
    A[Start reconciliation] --> B[Request installation token]
    B --> C[Fetch current GitHub Project state]
    C --> D[Normalize field values]
    D --> E[Compare with stored current state]
    E --> F{Values match?}
    F -- Yes --> G[Count as verified]
    F -- No --> H[Record mismatch]
    G --> I[Store reconciliation result]
    H --> I
    I --> J[Display checked and mismatch counts]
```

A reconciliation mismatch is evidence of state drift. It is not historical proof of who made the missing change or when. The product must not fabricate an audit event from a mismatch.

## 7. Delivery state machine

```mermaid
stateDiagram-v2
    [*] --> Received
    Received --> Rejected: Invalid signature
    Received --> Duplicate: Delivery already exists
    Received --> Stored: Valid new delivery
    Stored --> Ignored: Untracked event or Project
    Stored --> Processing: Relevant field change
    Processing --> Processed: Event and state committed
    Processing --> Failed: Unsupported payload or error
    Failed --> Processing: Manual retry
    Rejected --> [*]
    Duplicate --> [*]
    Ignored --> [*]
    Processed --> [*]
```

## 8. Prototype completion gate

```mermaid
flowchart TD
    A[Run 50 documented field changes] --> B{Exactly 50 events?}
    B -- No --> C[Prototype fails]
    B -- Yes --> D{All values and actors correct?}
    D -- No --> C
    D -- Yes --> E{Redeliveries deduplicated?}
    E -- No --> C
    E -- Yes --> F{Reconciliation clean?}
    F -- No --> C
    F -- Yes --> G[Prototype passes]
```

## 9. Future rollback boundary

```mermaid
flowchart TD
    A[Customer requests rollback] --> B{Audit MVP proven?}
    B -- No --> C[Do not build rollback]
    B -- Yes --> D{Customer accepts write permission?}
    D -- No --> C
    D -- Yes --> E[Design single-field preview]
    E --> F[Check expected current value]
    F --> G[Confirm mutation]
    G --> H[Apply GitHub update]
    H --> I[Capture resulting webhook event]
```

Rollback is phase two. It is not part of the prototype described here.


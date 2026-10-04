# json-cardinality-report

Measure per-field cardinality, coverage and type variation across newline-delimited JSON without printing raw values.

```sh
npx --yes github:b69ca/json-cardinality-report events.jsonl
npx --yes github:b69ca/json-cardinality-report events.jsonl --ignore /request/id --fail-ratio 0.95 --json
```

Fields are flattened to JSON Pointer paths. Arrays remain atomic. Reports classify constant, low, medium and near-unique fields and show only short SHA-256 fingerprints for the most frequent values. This is useful for finding accidentally high-cardinality metric labels, identifiers that defeat grouping, and fields too sparse to index effectively.

`--fail-ratio` provides a CI gate; findings at or above the ratio exit 1 and bad input exits 2. Fingerprints do not make guessable low-entropy values secret. Zero dependencies, Node.js 20+, MIT licensed.

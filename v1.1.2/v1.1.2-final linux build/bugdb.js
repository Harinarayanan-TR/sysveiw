const severities = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const impactLevels = {
  none: 'none',
  app: 'app',
  host: 'host'
};

const rules = [
  {
    code: 'BUG0001',
    title: 'Syntax Error',
    severity: 'high',
    impact: 'app',
    category: 'syntax',
    confidence: 0.99,
    falsePositiveRisk: 0.02,
    evidence: 'Parser or VM script compilation error with exact location and token information.',
    description: 'JavaScript syntax error detected during source compilation.',
    detection: 'The source file fails vm.Script compilation in Node.js.'
  },
  {
    code: 'BUG0002',
    title: 'Invalid JSON',
    severity: 'high',
    impact: 'app',
    category: 'data',
    confidence: 0.98,
    falsePositiveRisk: 0.03,
    evidence: 'JSON parse failure with line and column details from the parser.',
    description: 'Malformed JSON detected in configuration or data files.',
    detection: 'JSON.parse of file content fails due to invalid syntax.'
  },
  {
    code: 'BUG0003',
    title: 'Missing Module Reference',
    severity: 'medium',
    impact: 'app',
    category: 'dependency',
    confidence: 0.96,
    falsePositiveRisk: 0.05,
    evidence: 'Local require/import path resolves to no existing file or index module.',
    description: 'Require/import target is missing or unresolved.',
    detection: 'Static require path points to a candidate path with no matching file.'
  },
  {
    code: 'BUG0004',
    title: 'Unused Function or Class',
    severity: 'low',
    impact: 'none',
    category: 'code-quality',
    confidence: 0.70,
    falsePositiveRisk: 0.55,
    evidence: 'Declared symbol has only a single occurrence or no direct references.',
    description: 'Function or class exists but may not be exercised by the current code base.',
    detection: 'Declaration appears without meaningful reference count across source files.'
  },
  {
    code: 'BUG0005',
    title: 'Memory Growth Anomaly',
    severity: 'medium',
    impact: 'app',
    category: 'performance',
    confidence: 0.93,
    falsePositiveRisk: 0.10,
    evidence: 'Heap usage rises consistently and RSS exceeds expected bounds.',
    description: 'Memory usage is rising steadily and may indicate a leak.',
    detection: 'Consecutive heap growth above thresholds and high RSS on repeated scans.'
  },
  {
    code: 'BUG0006',
    title: 'Pipeline Overload',
    severity: 'medium',
    impact: 'app',
    category: 'pipeline',
    confidence: 0.96,
    falsePositiveRisk: 0.08,
    evidence: 'Pipeline queue length exceeds a safe processing threshold.',
    description: 'A pipeline queue has grown beyond a safe threshold.',
    detection: 'More than 80 unprocessed entries are present in the pipeline.'
  },
  {
    code: 'BUG0007',
    title: 'Pipeline Malformed Message',
    severity: 'high',
    impact: 'app',
    category: 'pipeline',
    confidence: 0.98,
    falsePositiveRisk: 0.04,
    evidence: 'Message structure lacks required fields or timestamp metadata.',
    description: 'Pipeline message does not meet expected structure or fields.',
    detection: 'Entry object is malformed or missing required fields.'
  },
  {
    code: 'BUG0008',
    title: 'Host-Impact Abnormality',
    severity: 'high',
    impact: 'host',
    category: 'system',
    confidence: 0.97,
    falsePositiveRisk: 0.06,
    evidence: 'Detected condition can impact OS resources or host-level processes.',
    description: 'An abnormality may impact the host system or environment.',
    detection: 'Evidence of host-impacting behavior from monitoring heuristics.'
  },
  {
    code: 'BUG0009',
    title: 'File Permission Anomaly',
    severity: 'medium',
    impact: 'host',
    category: 'host',
    confidence: 0.92,
    falsePositiveRisk: 0.12,
    evidence: 'Filesystem access issue appears related to permission or lock state.',
    description: 'File permission or access settings may prevent normal app operation.',
    detection: 'File read/write operations fail due to permission errors.'
  },
  {
    code: 'BUG0010',
    title: 'Data Drift',
    severity: 'low',
    impact: 'none',
    category: 'data',
    confidence: 0.78,
    falsePositiveRisk: 0.35,
    evidence: 'Configuration or state values are inconsistent with expected schema.',
    description: 'Configuration or state data appears inconsistent or stale.',
    detection: 'Data values are inconsistent across files or missing expected structures.'
  },
  {
    code: 'BUG0011',
    title: 'Module Restart Required',
    severity: 'medium',
    impact: 'app',
    category: 'recovery',
    confidence: 0.91,
    falsePositiveRisk: 0.15,
    evidence: 'Repeated module anomalies suggest restart may recover state.',
    description: 'A module must be restarted to recover from repeated abnormal behavior.',
    detection: 'Same issue recurs over scan iterations despite previous recoveries.'
  },
  {
    code: 'BUG0012',
    title: 'Module Recovery Escalation',
    severity: 'high',
    impact: 'app',
    category: 'recovery',
    confidence: 0.95,
    falsePositiveRisk: 0.09,
    evidence: 'Multiple restart attempts failed to clear the anomaly.',
    description: 'Repeated restart attempts failed; escalation is required.',
    detection: 'More than two restart attempts have not resolved the issue.'
  },
  {
    code: 'BUG0013',
    title: 'Boot Sequence Inconsistency',
    severity: 'high',
    impact: 'app',
    category: 'boot',
    confidence: 0.97,
    falsePositiveRisk: 0.05,
    evidence: 'Boot step did not finish before the next step began.',
    description: 'Boot sequence step did not complete as expected before advancing.',
    detection: 'Ordered boot events are mismatched or skipped during startup.'
  },
  {
    code: 'BUG0014',
    title: 'Runtime Resource Pressure',
    severity: 'medium',
    impact: 'host',
    category: 'performance',
    confidence: 0.94,
    falsePositiveRisk: 0.11,
    evidence: 'CPU or memory metrics exceed expected thresholds for normal operation.',
    description: 'CPU, memory, or system resource use is abnormal for the app state.',
    detection: 'System resources exceed heuristics while the app is in normal scan mode.'
  },
  {
    code: 'BUG0015',
    title: 'App Module Drift',
    severity: 'low',
    impact: 'none',
    category: 'code-quality',
    confidence: 0.72,
    falsePositiveRisk: 0.40,
    evidence: 'Source structure changes or unusual syntax patterns were observed.',
    description: 'Code structure changes or odd patterns were observed during scanning.',
    detection: 'Unexpected symbol patterns appear in source code analysis.'
  }
];

function findRule(code) {
  return rules.find(rule => rule.code === code) || null;
}

function getSeverityLevel(severity) {
  return severities[severity] || severities.low;
}

module.exports = {
  severities,
  impactLevels,
  rules,
  findRule,
  getSeverityLevel
};

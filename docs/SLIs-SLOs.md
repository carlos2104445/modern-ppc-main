# Service Level Indicators (SLIs) and Service Level Objectives (SLOs)

## Overview

This document defines the SLIs and SLOs for the Modern PPC application. These metrics help us measure and maintain the reliability and performance of our service.

## Critical User Journeys

1. User Authentication (Login/Signup)
2. Campaign Creation
3. Ad Viewing
4. Payment Processing
5. Admin Operations

## Service Level Indicators (SLIs)

### 1. Availability SLI

**Definition**: Percentage of successful HTTP requests (non-5xx responses)

**Measurement**:

```
availability = (successful_requests / total_requests) * 100
```

**Data Source**: Prometheus metric `http_requests_total`

### 2. Latency SLI

**Definition**: Percentage of requests completed within target latency

**Measurement**:

```
latency_sli = (requests_under_threshold / total_requests) * 100
```

**Thresholds**:

- API endpoints: p95 < 500ms
- Database queries: p95 < 100ms
- Redis operations: p95 < 50ms

**Data Source**: Prometheus metrics `http_request_duration_seconds`, `database_query_duration_seconds`, `redis_operation_duration_seconds`

### 3. Error Rate SLI

**Definition**: Percentage of requests that complete without errors

**Measurement**:

```
error_rate = (failed_requests / total_requests) * 100
success_rate = 100 - error_rate
```

**Data Source**: Prometheus metric `http_requests_total{status_code=~"5.."}`

### 4. Authentication Success SLI

**Definition**: Percentage of authentication attempts that succeed

**Measurement**:

```
auth_success_rate = (successful_auth / total_auth_attempts) * 100
```

**Data Source**: Prometheus metric `authentication_attempts_total`

### 5. Payment Success SLI

**Definition**: Percentage of payment transactions that complete successfully

**Measurement**:

```
payment_success_rate = (successful_payments / total_payment_attempts) * 100
```

**Data Source**: Prometheus metric `payments_processed_total`

## Service Level Objectives (SLOs)

### Tier 1: Critical Services (99.9% uptime target)

#### Authentication Service

- **Availability SLO**: 99.9% of requests succeed (< 0.1% 5xx errors)
- **Latency SLO**: 95% of requests complete in < 500ms
- **Error Budget**: 43.2 minutes of downtime per month
- **Monitoring**: Alert if availability drops below 99.5% over 5-minute window

#### Payment Processing

- **Availability SLO**: 99.9% of payment requests succeed
- **Latency SLO**: 95% of payment requests complete in < 2s
- **Success Rate SLO**: 99% of valid payment attempts succeed
- **Error Budget**: 43.2 minutes of downtime per month
- **Monitoring**: Alert immediately on payment failures

### Tier 2: Core Services (99.5% uptime target)

#### Campaign Management

- **Availability SLO**: 99.5% of requests succeed
- **Latency SLO**: 95% of requests complete in < 500ms
- **Error Budget**: 3.6 hours of downtime per month
- **Monitoring**: Alert if availability drops below 99% over 15-minute window

#### Ad Viewing Service

- **Availability SLO**: 99.5% of ad view requests succeed
- **Latency SLO**: 95% of ad views load in < 1s
- **Error Budget**: 3.6 hours of downtime per month
- **Monitoring**: Alert if availability drops below 99% over 15-minute window

### Tier 3: Supporting Services (99% uptime target)

#### Admin Panel

- **Availability SLO**: 99% of requests succeed
- **Latency SLO**: 95% of requests complete in < 1s
- **Error Budget**: 7.2 hours of downtime per month
- **Monitoring**: Alert if availability drops below 98% over 30-minute window

#### Reporting & Analytics

- **Availability SLO**: 99% of requests succeed
- **Latency SLO**: 95% of requests complete in < 5s
- **Error Budget**: 7.2 hours of downtime per month
- **Monitoring**: Alert if availability drops below 98% over 30-minute window

## Infrastructure SLOs

### Database

- **Availability SLO**: 99.95% uptime
- **Query Latency SLO**: 95% of queries complete in < 100ms
- **Connection Pool SLO**: < 80% utilization under normal load

### Redis Cache

- **Availability SLO**: 99.9% uptime
- **Operation Latency SLO**: 95% of operations complete in < 50ms
- **Hit Rate SLO**: > 80% cache hit rate

### External Dependencies

#### Chapa Payment Gateway

- **Availability SLO**: 99% (external service)
- **Timeout**: 30 seconds
- **Retry Policy**: 3 retries with exponential backoff
- **Circuit Breaker**: Open after 5 consecutive failures

## Alerting Thresholds

### Critical Alerts (Page immediately)

- Availability drops below SLO for 5 consecutive minutes
- Payment processing failure rate > 5%
- Database connection failures
- Redis connection failures
- Error rate > 1% for 5 minutes

### Warning Alerts (Notify during business hours)

- Latency p95 exceeds SLO for 15 minutes
- Error budget consumption > 50% in current month
- Cache hit rate < 70%
- Memory usage > 80%

### Info Alerts (Log only)

- Latency p95 exceeds SLO for 5 minutes
- Error budget consumption > 25% in current month
- Unusual traffic patterns

## Error Budget Policy

### Monthly Error Budget Calculation

```
error_budget_minutes = (1 - SLO_percentage) * minutes_in_month
```

Examples:

- 99.9% SLO = 43.2 minutes/month
- 99.5% SLO = 216 minutes/month (3.6 hours)
- 99% SLO = 432 minutes/month (7.2 hours)

### Error Budget Consumption Actions

#### > 75% consumed

- Freeze non-critical feature releases
- Focus on reliability improvements
- Increase monitoring and alerting
- Conduct incident reviews

#### > 90% consumed

- Freeze all feature releases
- Emergency reliability sprint
- Daily incident reviews
- Executive escalation

#### 100% consumed

- Complete feature freeze
- All hands on reliability
- Root cause analysis for all incidents
- Post-mortem for SLO breach

## Review and Updates

- **Weekly**: Review SLI metrics and error budget consumption
- **Monthly**: Review SLO targets and adjust if needed
- **Quarterly**: Comprehensive SLI/SLO review and update
- **After Major Incidents**: Review and update relevant SLOs

## Measurement Tools

- **Prometheus**: Primary metrics collection
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and management
- **PagerDuty/Opsgenie**: Incident management
- **DataDog/New Relic**: APM and distributed tracing

## References

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Error Budget Policy](https://sre.google/workbook/error-budget-policy/)

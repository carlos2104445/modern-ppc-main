# Incident Runbooks

## Table of Contents

1. [High Error Rate](#high-error-rate)
2. [Database Connection Failures](#database-connection-failures)
3. [Redis Connection Failures](#redis-connection-failures)
4. [Payment Processing Failures](#payment-processing-failures)
5. [High Latency](#high-latency)
6. [Memory Leak](#memory-leak)
7. [Authentication Failures](#authentication-failures)
8. [Deployment Rollback](#deployment-rollback)

---

## High Error Rate

### Symptoms

- Error rate > 1% for 5+ minutes
- Increased 5xx responses
- User reports of service unavailability

### Triage Steps

1. **Check Grafana Dashboard**
   - Navigate to Application Metrics dashboard
   - Identify which endpoints are failing
   - Check error rate by route and status code

2. **Check Logs**

   ```bash
   kubectl logs -n production deployment/modern-ppc --tail=100 | grep ERROR
   ```

3. **Check Recent Deployments**
   ```bash
   kubectl rollout history deployment/modern-ppc -n production
   ```

### Resolution Steps

#### If caused by recent deployment:

```bash
# Rollback to previous version
kubectl rollout undo deployment/modern-ppc -n production

# Verify rollback
kubectl rollout status deployment/modern-ppc -n production
```

#### If caused by external dependency:

1. Check Chapa payment gateway status
2. Check database connectivity
3. Check Redis connectivity
4. Enable circuit breaker if needed

#### If caused by bad data:

1. Identify problematic records in logs
2. Fix data in database
3. Clear relevant caches

### Post-Incident

1. Create incident report
2. Update error handling for identified edge cases
3. Add monitoring for similar issues
4. Schedule post-mortem meeting

---

## Database Connection Failures

### Symptoms

- "Connection pool exhausted" errors
- "Cannot connect to database" errors
- Increased database query latency

### Triage Steps

1. **Check Database Status**

   ```bash
   # Check PostgreSQL status
   kubectl get pods -n database | grep postgres

   # Check connection count
   psql -h $DB_HOST -U $DB_USER -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. **Check Connection Pool**
   - Review Grafana database metrics
   - Check active connections vs pool size

3. **Check Database Logs**
   ```bash
   kubectl logs -n database deployment/postgres --tail=100
   ```

### Resolution Steps

#### If connection pool exhausted:

```bash
# Increase connection pool size (temporary)
kubectl set env deployment/modern-ppc -n production MAX_DB_CONNECTIONS=50

# Restart application pods
kubectl rollout restart deployment/modern-ppc -n production
```

#### If database is down:

```bash
# Check database pod status
kubectl describe pod -n database postgres-0

# Restart database if needed
kubectl delete pod -n database postgres-0

# Verify database is healthy
kubectl get pods -n database -w
```

#### If too many long-running queries:

```sql
-- Identify long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Kill problematic queries
SELECT pg_terminate_backend(pid);
```

### Post-Incident

1. Review and optimize slow queries
2. Adjust connection pool settings
3. Implement query timeout policies
4. Add database connection monitoring

---

## Redis Connection Failures

### Symptoms

- "Redis connection refused" errors
- Cache misses increase dramatically
- Session management failures

### Triage Steps

1. **Check Redis Status**

   ```bash
   kubectl get pods -n cache | grep redis
   kubectl logs -n cache deployment/redis --tail=100
   ```

2. **Test Redis Connection**

   ```bash
   redis-cli -h $REDIS_HOST ping
   ```

3. **Check Redis Memory**
   ```bash
   redis-cli -h $REDIS_HOST info memory
   ```

### Resolution Steps

#### If Redis is down:

```bash
# Restart Redis
kubectl rollout restart deployment/redis -n cache

# Verify Redis is healthy
kubectl get pods -n cache -w
```

#### If Redis memory is full:

```bash
# Clear cache (use with caution)
redis-cli -h $REDIS_HOST FLUSHDB

# Or increase memory limit
kubectl set resources deployment/redis -n cache --limits=memory=2Gi
```

#### If connection limit reached:

```bash
# Increase max connections
redis-cli -h $REDIS_HOST CONFIG SET maxclients 10000
```

### Post-Incident

1. Review cache eviction policies
2. Implement cache warming strategy
3. Add Redis memory monitoring
4. Review connection pooling settings

---

## Payment Processing Failures

### Symptoms

- Payment success rate < 95%
- Chapa webhook failures
- User reports of failed payments

### Triage Steps

1. **Check Chapa Status**
   - Visit Chapa status page
   - Check recent webhook deliveries

2. **Check Payment Logs**

   ```bash
   kubectl logs -n production deployment/modern-ppc | grep "payment" | tail -100
   ```

3. **Check Database**
   ```sql
   SELECT status, COUNT(*)
   FROM chapa_payments
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY status;
   ```

### Resolution Steps

#### If Chapa is down:

1. Enable maintenance mode for payments
2. Queue payment requests for retry
3. Notify users of temporary issues

#### If webhook failures:

```bash
# Check webhook endpoint
curl -X POST https://api.modern-ppc.com/api/webhooks/chapa \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Manually process failed webhooks
node scripts/process-pending-payments.js
```

#### If database issues:

1. Check payment transaction logs
2. Reconcile with Chapa dashboard
3. Update payment statuses manually if needed

### Post-Incident

1. Implement payment retry mechanism
2. Add payment reconciliation job
3. Improve webhook reliability
4. Add payment monitoring alerts

---

## High Latency

### Symptoms

- p95 latency > 500ms
- User reports of slow page loads
- Increased timeout errors

### Triage Steps

1. **Check Grafana Latency Dashboard**
   - Identify slow endpoints
   - Check database query latency
   - Check Redis operation latency

2. **Check APM Traces**
   - Review DataDog/New Relic traces
   - Identify bottlenecks

3. **Check Resource Usage**
   ```bash
   kubectl top pods -n production
   kubectl top nodes
   ```

### Resolution Steps

#### If database queries are slow:

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_name ON table_name(column);
```

#### If high CPU usage:

```bash
# Scale up replicas
kubectl scale deployment/modern-ppc -n production --replicas=5

# Or increase resources
kubectl set resources deployment/modern-ppc -n production \
  --limits=cpu=2000m,memory=2Gi
```

#### If cache misses:

1. Warm up cache
2. Increase cache TTL
3. Review cache invalidation logic

### Post-Incident

1. Optimize slow queries
2. Implement caching strategy
3. Add performance monitoring
4. Review and optimize code

---

## Memory Leak

### Symptoms

- Steadily increasing memory usage
- OOMKilled pod restarts
- Degraded performance over time

### Triage Steps

1. **Check Memory Usage**

   ```bash
   kubectl top pods -n production
   kubectl describe pod -n production <pod-name>
   ```

2. **Check Heap Snapshots**
   - Take heap snapshot
   - Analyze with Chrome DevTools

3. **Check Logs for Memory Warnings**
   ```bash
   kubectl logs -n production deployment/modern-ppc | grep -i "memory"
   ```

### Resolution Steps

#### Immediate mitigation:

```bash
# Restart affected pods
kubectl rollout restart deployment/modern-ppc -n production

# Increase memory limits temporarily
kubectl set resources deployment/modern-ppc -n production \
  --limits=memory=4Gi
```

#### Investigation:

```javascript
// Add heap snapshot endpoint
app.get("/debug/heap-snapshot", (req, res) => {
  const heapdump = require("heapdump");
  const filename = `/tmp/heapdump-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err) => {
    if (err) return res.status(500).send(err);
    res.download(filename);
  });
});
```

### Post-Incident

1. Fix memory leak in code
2. Add memory monitoring alerts
3. Implement automatic pod restarts
4. Review resource limits

---

## Authentication Failures

### Symptoms

- Users cannot log in
- JWT verification failures
- Session management issues

### Triage Steps

1. **Check Auth Logs**

   ```bash
   kubectl logs -n production deployment/modern-ppc | grep "auth" | tail -100
   ```

2. **Check JWT Secret**

   ```bash
   kubectl get secret jwt-secret -n production -o yaml
   ```

3. **Check Redis (Session Store)**
   ```bash
   redis-cli -h $REDIS_HOST ping
   ```

### Resolution Steps

#### If JWT secret rotated:

1. Invalidate all existing tokens
2. Force users to re-login
3. Update secret in all environments

#### If Redis is down:

1. Restart Redis (see Redis runbook)
2. Users will need to re-login

#### If database issues:

1. Check user table accessibility
2. Verify password hashing is working

### Post-Incident

1. Implement graceful JWT secret rotation
2. Add authentication monitoring
3. Implement backup session storage
4. Add rate limiting for auth endpoints

---

## Deployment Rollback

### When to Rollback

- Error rate > 5% after deployment
- Critical functionality broken
- Performance degradation > 50%
- Security vulnerability introduced

### Rollback Steps

```bash
# 1. Check current deployment
kubectl get deployment modern-ppc -n production

# 2. View rollout history
kubectl rollout history deployment/modern-ppc -n production

# 3. Rollback to previous version
kubectl rollout undo deployment/modern-ppc -n production

# 4. Or rollback to specific revision
kubectl rollout undo deployment/modern-ppc -n production --to-revision=5

# 5. Monitor rollback progress
kubectl rollout status deployment/modern-ppc -n production

# 6. Verify application health
curl https://api.modern-ppc.com/health
curl https://api.modern-ppc.com/ready

# 7. Check error rates in Grafana
# Navigate to Application Metrics dashboard
```

### Post-Rollback

1. Identify root cause of deployment failure
2. Fix issues in development environment
3. Add tests to prevent regression
4. Schedule new deployment with fixes

---

## General Incident Response Process

### 1. Acknowledge (< 5 minutes)

- Acknowledge alert in PagerDuty/Opsgenie
- Post in #incidents Slack channel
- Assign incident commander

### 2. Assess (< 10 minutes)

- Determine severity (P0-P4)
- Identify affected services
- Estimate user impact

### 3. Mitigate (< 30 minutes for P0/P1)

- Follow relevant runbook
- Implement immediate fixes
- Communicate with stakeholders

### 4. Resolve

- Verify issue is resolved
- Monitor for recurrence
- Update incident status

### 5. Post-Mortem (within 48 hours)

- Document timeline
- Identify root cause
- Create action items
- Share learnings with team

## Escalation Paths

### P0 (Critical - Service Down)

- Page: On-call engineer
- Escalate to: Engineering Manager (if not resolved in 15 min)
- Notify: CTO, CEO

### P1 (High - Major Feature Down)

- Page: On-call engineer
- Escalate to: Engineering Manager (if not resolved in 30 min)
- Notify: Engineering team

### P2 (Medium - Minor Feature Degraded)

- Alert: On-call engineer
- Escalate to: Engineering Manager (if not resolved in 2 hours)

### P3/P4 (Low - Minimal Impact)

- Ticket: Create Jira ticket
- Assign: Next sprint

## Contact Information

- On-call Engineer: PagerDuty rotation
- Engineering Manager: Slack @eng-manager
- DevOps Team: Slack #devops
- Database Admin: Slack @dba
- Security Team: Slack #security

## Useful Commands

```bash
# Check pod status
kubectl get pods -n production

# View pod logs
kubectl logs -n production deployment/modern-ppc --tail=100 -f

# Execute command in pod
kubectl exec -it -n production deployment/modern-ppc -- /bin/sh

# Check resource usage
kubectl top pods -n production
kubectl top nodes

# Scale deployment
kubectl scale deployment/modern-ppc -n production --replicas=3

# Update environment variable
kubectl set env deployment/modern-ppc -n production KEY=value

# Restart deployment
kubectl rollout restart deployment/modern-ppc -n production

# Check deployment status
kubectl rollout status deployment/modern-ppc -n production
```

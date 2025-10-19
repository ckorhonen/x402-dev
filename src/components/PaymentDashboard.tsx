/**
 * Payment Dashboard Component
 */

import React, { useState, useEffect } from 'react';
import { X402Client } from '../lib/client';
import type { PaymentResponse, PaymentStatus } from '../lib/types';

interface PaymentDashboardProps {
  apiKey: string;
  baseUrl?: string;
  refreshInterval?: number; // in milliseconds
  onPaymentClick?: (payment: PaymentResponse) => void;
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  apiKey,
  baseUrl,
  refreshInterval = 30000,
  onPaymentClick,
}) => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const client = new X402Client({ apiKey, baseUrl });

  const loadPayments = async () => {
    try {
      setError(null);
      const result = await client.listPayments({
        limit: 50,
        offset: 0,
        status: filter === 'all' ? undefined : filter,
      });
      setPayments(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();

    // Set up auto-refresh
    const interval = setInterval(() => {
      loadPayments();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [filter]);

  const sortedPayments = [...payments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
      case 'awaiting_payment':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'failed':
      case 'cancelled':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amounts are in cents
  };

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'awaiting_payment' || p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading && payments.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading payments...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment Dashboard</h1>
        <button
          onClick={loadPayments}
          style={styles.refreshButton}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Payments</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={{...styles.statCard, borderColor: '#10b981'}}>
          <div style={styles.statLabel}>Completed</div>
          <div style={{...styles.statValue, color: '#10b981'}}>{stats.completed}</div>
        </div>
        <div style={{...styles.statCard, borderColor: '#f59e0b'}}>
          <div style={styles.statLabel}>Pending</div>
          <div style={{...styles.statValue, color: '#f59e0b'}}>{stats.pending}</div>
        </div>
        <div style={{...styles.statCard, borderColor: '#ef4444'}}>
          <div style={styles.statLabel}>Failed</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.failed}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Revenue</div>
          <div style={styles.statValue}>
            {formatAmount(stats.totalAmount, payments[0]?.currency || 'USD')}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PaymentStatus | 'all')}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            style={styles.select}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div style={styles.paymentsList}>
        {sortedPayments.length === 0 ? (
          <div style={styles.emptyState}>
            No payments found
          </div>
        ) : (
          sortedPayments.map((payment) => (
            <div
              key={payment.id}
              style={styles.paymentCard}
              onClick={() => onPaymentClick && onPaymentClick(payment)}
            >
              <div style={styles.paymentHeader}>
                <div style={styles.paymentId}>#{payment.id}</div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(payment.status) + '20',
                    color: getStatusColor(payment.status),
                  }}
                >
                  {payment.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div style={styles.paymentBody}>
                <div style={styles.paymentAmount}>
                  {formatAmount(payment.amount, payment.currency)}
                </div>
                {payment.description && (
                  <div style={styles.paymentDescription}>{payment.description}</div>
                )}
                <div style={styles.paymentDate}>
                  Created: {formatDate(payment.createdAt)}
                </div>
                {payment.expiresAt && payment.status === 'awaiting_payment' && (
                  <div style={styles.paymentExpiry}>
                    Expires: {formatDate(payment.expiresAt)}
                  </div>
                )}
              </div>

              {payment.paymentUrl && payment.status === 'awaiting_payment' && (
                <div style={styles.paymentFooter}>
                  <a
                    href={payment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.paymentLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Complete Payment →
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
    color: '#1f2937',
  },
  refreshButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    fontSize: '18px',
    color: '#6b7280',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1f2937',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#4b5563',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  paymentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    fontSize: '16px',
    color: '#9ca3af',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  paymentId: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  statusBadge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 700,
    borderRadius: '12px',
  },
  paymentBody: {
    marginBottom: '12px',
  },
  paymentAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '8px',
  },
  paymentDescription: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '8px',
  },
  paymentDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  paymentExpiry: {
    fontSize: '12px',
    color: '#f59e0b',
    marginTop: '4px',
  },
  paymentFooter: {
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  paymentLink: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#3b82f6',
    textDecoration: 'none',
  },
};

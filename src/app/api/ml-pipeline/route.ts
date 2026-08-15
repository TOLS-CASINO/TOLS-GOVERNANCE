import { NextResponse } from 'next/server'

const now = new Date()
const ts = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()

const models = [
  { id: 'ml-001', name: 'Churn Predictor', type: 'classification', algorithm: 'xgboost', version: '2.1.0', status: 'deployed', accuracy: 0.942, precision: 0.931, recall: 0.954, f1Score: 0.942, features: JSON.stringify(['days_since_last_login', 'total_deposits', 'avg_session_length', 'loss_ratio', 'bonus_claims', 'vip_level']), hyperparams: JSON.stringify({ maxDepth: 8, learningRate: 0.05, nEstimators: 500 }), trainingDataSize: 125000, lastTrainedAt: ts(1440), deployedAt: ts(720), isActive: true, createdAt: '2024-06-01T00:00:00.000Z' },
  { id: 'ml-002', name: 'Revenue Forecaster', type: 'regression', algorithm: 'lstm', version: '1.3.0', status: 'deployed', accuracy: 0.897, precision: null, recall: null, f1Score: null, features: JSON.stringify(['daily_revenue', 'player_count', 'avg_bet_size', 'seasonal_index', 'promo_active']), hyperparams: JSON.stringify({ layers: [64, 32, 16], epochs: 200, batchSize: 32 }), trainingDataSize: 730000, lastTrainedAt: ts(2880), deployedAt: ts(1440), isActive: true, createdAt: '2024-05-15T00:00:00.000Z' },
  { id: 'ml-003', name: 'Fraud Detector', type: 'anomaly_detection', algorithm: 'random_forest', version: '3.0.0', status: 'deployed', accuracy: 0.978, precision: 0.962, recall: 0.991, f1Score: 0.976, features: JSON.stringify(['transaction_amount', 'velocity_1h', 'geo_distance', 'device_fingerprint', 'ip_reputation', 'time_since_last_tx']), hyperparams: JSON.stringify({ nEstimators: 300, contamination: 0.01 }), trainingDataSize: 2500000, lastTrainedAt: ts(4320), deployedAt: ts(2160), isActive: true, createdAt: '2024-04-01T00:00:00.000Z' },
  { id: 'ml-004', name: 'Player Segmentation', type: 'classification', algorithm: 'neural_network', version: '1.0.0', status: 'trained', accuracy: 0.913, precision: 0.905, recall: 0.921, f1Score: 0.913, features: JSON.stringify(['ltv', 'deposit_frequency', 'game_diversity', 'churn_risk', 'preferred_category']), hyperparams: JSON.stringify({ layers: [128, 64, 32], dropout: 0.3 }), trainingDataSize: 50000, lastTrainedAt: ts(360), deployedAt: null, isActive: true, createdAt: '2024-08-01T00:00:00.000Z' },
  { id: 'ml-005', name: 'AML Risk Scorer', type: 'classification', algorithm: 'xgboost', version: '2.0.0', status: 'training', accuracy: null, precision: null, recall: null, f1Score: null, features: JSON.stringify(['transaction_patterns', 'geo_risk', 'pep_match', 'sanctions_match', 'structuring_score']), hyperparams: JSON.stringify({ maxDepth: 10, learningRate: 0.01, nEstimators: 1000 }), trainingDataSize: 5000000, lastTrainedAt: null, deployedAt: null, isActive: true, createdAt: '2024-09-01T00:00:00.000Z' },
  { id: 'ml-006', name: 'Game Recommender', type: 'nlp', algorithm: 'neural_network', version: '1.1.0', status: 'draft', accuracy: null, precision: null, recall: null, f1Score: null, features: JSON.stringify(['game_history', 'player_preferences', 'social_graph', 'trending_games']), hyperparams: null, trainingDataSize: null, lastTrainedAt: null, deployedAt: null, isActive: true, createdAt: '2024-10-01T00:00:00.000Z' },
]

const predictions = [
  { id: 'p-001', modelId: 'ml-001', modelName: 'Churn Predictor', entityType: 'player', entityId: 'P-2001', input: JSON.stringify({ days_since_last_login: 14, total_deposits: 2500 }), output: JSON.stringify({ churn_probability: 0.82, risk_level: 'high' }), confidence: 0.82, durationMs: 12, executedAt: ts(5) },
  { id: 'p-002', modelId: 'ml-002', modelName: 'Revenue Forecaster', entityType: 'game', entityId: 'G-001', input: JSON.stringify({ daily_revenue: 45000, player_count: 1200 }), output: JSON.stringify({ forecast_7d: 315000, trend: 'up' }), confidence: 0.78, durationMs: 45, executedAt: ts(10) },
  { id: 'p-003', modelId: 'ml-003', modelName: 'Fraud Detector', entityType: 'transaction', entityId: 'TX-3001', input: JSON.stringify({ amount: 15000, velocity_1h: 5 }), output: JSON.stringify({ is_fraud: false, risk_score: 0.12 }), confidence: 0.95, durationMs: 8, executedAt: ts(15) },
  { id: 'p-004', modelId: 'ml-001', modelName: 'Churn Predictor', entityType: 'player', entityId: 'P-2002', input: JSON.stringify({ days_since_last_login: 2, total_deposits: 15000 }), output: JSON.stringify({ churn_probability: 0.08, risk_level: 'low' }), confidence: 0.91, durationMs: 11, executedAt: ts(20) },
  { id: 'p-005', modelId: 'ml-003', modelName: 'Fraud Detector', entityType: 'transaction', entityId: 'TX-3002', input: JSON.stringify({ amount: 50000, velocity_1h: 12 }), output: JSON.stringify({ is_fraud: true, risk_score: 0.97 }), confidence: 0.97, durationMs: 9, executedAt: ts(25) },
  { id: 'p-006', modelId: 'ml-002', modelName: 'Revenue Forecaster', entityType: 'game', entityId: 'G-002', input: JSON.stringify({ daily_revenue: 28000, player_count: 800 }), output: JSON.stringify({ forecast_7d: 196000, trend: 'stable' }), confidence: 0.85, durationMs: 42, executedAt: ts(30) },
  { id: 'p-007', modelId: 'ml-001', modelName: 'Churn Predictor', entityType: 'player', entityId: 'P-2003', input: JSON.stringify({ days_since_last_login: 7, total_deposits: 500 }), output: JSON.stringify({ churn_probability: 0.45, risk_level: 'medium' }), confidence: 0.68, durationMs: 13, executedAt: ts(35) },
  { id: 'p-008', modelId: 'ml-003', modelName: 'Fraud Detector', entityType: 'transaction', entityId: 'TX-3003', input: JSON.stringify({ amount: 200, velocity_1h: 1 }), output: JSON.stringify({ is_fraud: false, risk_score: 0.02 }), confidence: 0.99, durationMs: 7, executedAt: ts(40) },
  { id: 'p-009', modelId: 'ml-002', modelName: 'Revenue Forecaster', entityType: 'game', entityId: 'G-003', input: JSON.stringify({ daily_revenue: 62000, player_count: 2100 }), output: JSON.stringify({ forecast_7d: 434000, trend: 'up' }), confidence: 0.72, durationMs: 48, executedAt: ts(45) },
  { id: 'p-010', modelId: 'ml-001', modelName: 'Churn Predictor', entityType: 'player', entityId: 'P-2004', input: JSON.stringify({ days_since_last_login: 30, total_deposits: 100 }), output: JSON.stringify({ churn_probability: 0.95, risk_level: 'critical' }), confidence: 0.95, durationMs: 10, executedAt: ts(50) },
  { id: 'p-011', modelId: 'ml-003', modelName: 'Fraud Detector', entityType: 'transaction', entityId: 'TX-3004', input: JSON.stringify({ amount: 8900, velocity_1h: 3 }), output: JSON.stringify({ is_fraud: false, risk_score: 0.35 }), confidence: 0.88, durationMs: 8, executedAt: ts(55) },
  { id: 'p-012', modelId: 'ml-002', modelName: 'Revenue Forecaster', entityType: 'game', entityId: 'G-004', input: JSON.stringify({ daily_revenue: 15000, player_count: 400 }), output: JSON.stringify({ forecast_7d: 105000, trend: 'down' }), confidence: 0.65, durationMs: 40, executedAt: ts(60) },
]

const trainingJobs = [
  { id: 'job-001', modelId: 'ml-005', modelName: 'AML Risk Scorer', status: 'running', progress: 67, startDate: ts(30), endDate: null, duration: null, metrics: JSON.stringify({ epoch: 67, loss: 0.15, valLoss: 0.18 }), error: null, createdAt: ts(30) },
  { id: 'job-002', modelId: 'ml-001', modelName: 'Churn Predictor', status: 'completed', progress: 100, startDate: ts(2880), endDate: ts(2700), duration: 180, metrics: JSON.stringify({ finalLoss: 0.08, finalAccuracy: 0.942 }), error: null, createdAt: ts(2880) },
  { id: 'job-003', modelId: 'ml-002', modelName: 'Revenue Forecaster', status: 'completed', progress: 100, startDate: ts(4320), endDate: ts(4080), duration: 240, metrics: JSON.stringify({ finalLoss: 0.12, finalAccuracy: 0.897 }), error: null, createdAt: ts(4320) },
  { id: 'job-004', modelId: 'ml-003', modelName: 'Fraud Detector', status: 'completed', progress: 100, startDate: ts(5760), endDate: ts(5400), duration: 360, metrics: JSON.stringify({ finalLoss: 0.03, finalAccuracy: 0.978 }), error: null, createdAt: ts(5760) },
  { id: 'job-005', modelId: 'ml-004', modelName: 'Player Segmentation', status: 'failed', progress: 45, startDate: ts(360), endDate: ts(330), duration: 30, metrics: JSON.stringify({ epoch: 45, loss: 0.32 }), error: 'CUDA out of memory. Tried to allocate 2.00 GiB', createdAt: ts(360) },
  { id: 'job-006', modelId: 'ml-006', modelName: 'Game Recommender', status: 'queued', progress: 0, startDate: null, endDate: null, duration: null, metrics: null, error: null, createdAt: ts(5) },
]

const featureStores = [
  { id: 'fs-001', name: 'Player Behavior', description: 'Aggregated player activity and engagement features', featureCount: 47, source: 'database', refreshInterval: 15, lastRefreshAt: ts(10), isActive: true },
  { id: 'fs-002', name: 'Transaction Patterns', description: 'Real-time transaction velocity and pattern features', featureCount: 23, source: 'stream', refreshInterval: 5, lastRefreshAt: ts(2), isActive: true },
  { id: 'fs-003', name: 'Game Analytics', description: 'Game performance and popularity metrics', featureCount: 31, source: 'database', refreshInterval: 30, lastRefreshAt: ts(25), isActive: true },
  { id: 'fs-004', name: 'Geo Demographics', description: 'Geographic and demographic segmentation data', featureCount: 18, source: 'api', refreshInterval: 60, lastRefreshAt: ts(45), isActive: true },
]

export async function GET() {
  return NextResponse.json({ models, predictions, trainingJobs, featureStores })
}

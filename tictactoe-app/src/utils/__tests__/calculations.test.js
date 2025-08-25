import { describe, it, expect } from 'vitest';
import {
  calculateCPCRaw,
  calculateCPCUnique,
  calculateCPRConfirm,
  calculateCPS,
  calculateROAS,
  aggregateMetrics,
  formatCurrency,
  formatPercentage,
  formatNumber
} from '../calculations';

describe('Campaign Calculations', () => {
  describe('calculateCPCRaw', () => {
    it('should calculate CPC correctly', () => {
      expect(calculateCPCRaw(100, 50)).toBe('2.00');
      expect(calculateCPCRaw(150, 75)).toBe('2.00');
    });

    it('should return 0.00 for zero clicks', () => {
      expect(calculateCPCRaw(100, 0)).toBe('0.00');
    });
  });

  describe('calculateCPCUnique', () => {
    it('should calculate unique CPC correctly', () => {
      expect(calculateCPCUnique(100, 40)).toBe('2.50');
      expect(calculateCPCUnique(200, 100)).toBe('2.00');
    });

    it('should return 0.00 for zero unique clicks', () => {
      expect(calculateCPCUnique(100, 0)).toBe('0.00');
    });
  });

  describe('calculateCPRConfirm', () => {
    it('should calculate CPR correctly', () => {
      expect(calculateCPRConfirm(1000, 10)).toBe('100.00');
      expect(calculateCPRConfirm(500, 25)).toBe('20.00');
    });

    it('should return 0.00 for zero registrations', () => {
      expect(calculateCPRConfirm(1000, 0)).toBe('0.00');
    });
  });

  describe('calculateCPS', () => {
    it('should calculate CPS correctly', () => {
      expect(calculateCPS(1000, 5)).toBe('200.00');
      expect(calculateCPS(2000, 10)).toBe('200.00');
    });

    it('should return 0.00 for zero sales', () => {
      expect(calculateCPS(1000, 0)).toBe('0.00');
    });
  });

  describe('calculateROAS', () => {
    it('should calculate ROAS correctly', () => {
      expect(calculateROAS(2000, 1000)).toBe('200.0');
      expect(calculateROAS(1500, 1000)).toBe('150.0');
    });

    it('should return 0.0 for zero cost', () => {
      expect(calculateROAS(2000, 0)).toBe('0.0');
    });
  });

  describe('aggregateMetrics', () => {
    const mockCampaigns = [
      {
        metrics: {
          cost: 1000,
          revenue: 2000,
          sales: 10,
          rawClicks: 100,
          uniqueClicks: 80,
          confirmReg: 15
        }
      },
      {
        metrics: {
          cost: 1500,
          revenue: 3000,
          sales: 20,
          rawClicks: 150,
          uniqueClicks: 120,
          confirmReg: 25
        }
      }
    ];

    it('should aggregate metrics correctly', () => {
      const result = aggregateMetrics(mockCampaigns);
      
      expect(result.totalCost).toBe(2500);
      expect(result.totalRevenue).toBe(5000);
      expect(result.totalSales).toBe(30);
      expect(result.totalClicks).toBe(250);
      expect(result.totalUniqueClicks).toBe(200);
      expect(result.totalRegistrations).toBe(40);
      expect(result.campaignCount).toBe(2);
      expect(result.totalCampaigns).toBe(2);
      expect(result.averageROAS).toBe(200);
    });

    it('should handle empty campaigns array', () => {
      const result = aggregateMetrics([]);
      
      expect(result.totalCost).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalSales).toBe(0);
      expect(result.campaignCount).toBe(0);
      expect(result.averageROAS).toBe(0);
      // totalCampaigns is only added in the successful path, not for empty arrays
    });

    it('should handle null/undefined campaigns', () => {
      const result = aggregateMetrics(null);
      
      expect(result.campaignCount).toBe(0);
      // totalCampaigns is only added in the successful path, not for null
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle null values', () => {
      expect(formatCurrency(null)).toBe('$0');
      expect(formatCurrency(undefined)).toBe('$0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle decimal places', () => {
      expect(formatPercentage(25.555, 2)).toBe('25.55%'); // Fixed - no rounding
      expect(formatPercentage(25.555, 0)).toBe('26%');
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers with suffixes', () => {
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(500)).toBe('500');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });
});
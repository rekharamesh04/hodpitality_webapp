/**
 * Business Workflow Test Suite
 * 
 * This file demonstrates and tests all business workflows
 * Run this in the browser console to test all functionality
 */

import { guestService, reportService, workflowService } from '@/services';

export class BusinessWorkflowTester {
  private results: any[] = [];

  log(message: string, data?: any) {
    console.log(`🔄 ${message}`, data ? data : '');
    this.results.push({ message, data, timestamp: new Date().toISOString() });
  }

  success(message: string, data?: any) {
    console.log(`✅ ${message}`, data ? data : '');
    this.results.push({ message, data, timestamp: new Date().toISOString(), status: 'success' });
  }

  error(message: string, error?: any) {
    console.error(`❌ ${message}`, error ? error : '');
    this.results.push({ message, error, timestamp: new Date().toISOString(), status: 'error' });
  }

  // ==================== TEST 1: Complete Registration Workflow ====================
  async testCompleteRegistration() {
    this.log('Testing Complete Registration Workflow...');
    
    try {
      const result = await workflowService.completeRegistration({
        guestName: "Test VIP Guest",
        email: "testvip@example.com",
        phone: "+1 (555) 999-8888",
        company: "VIP Corp",
        designation: "CEO",
        category: "VIP",
        eventId: "evt_test",
        eventTitle: "Test Summit 2024",
        paymentAmount: 1000,
        hospitalityRequests: [
          {
            type: "Hotel",
            description: "Presidential Suite - 5 nights",
            serviceDate: "2024-01-20",
            cost: 2000
          },
          {
            type: "Airport Pickup",
            description: "Luxury limousine with security",
            serviceDate: "2024-01-19",
            cost: 500
          },
          {
            type: "Special Request",
            description: "Private meeting room for 4 hours",
            serviceDate: "2024-01-21",
            cost: 800
          }
        ],
        notes: "High-profile guest requiring extra security and privacy"
      });

      if (result.success) {
        this.success('Complete Registration Successful', {
          guest: result.data?.guest.name,
          hospitality: result.data?.hospitality.length + ' services created',
          registration: result.data?.registration.status
        });
      } else {
        this.error('Complete Registration Failed', result.error);
      }
    } catch (error) {
      this.error('Complete Registration Error', error);
    }
  }

  // ==================== TEST 2: Check-in Workflows ====================
  async testCheckInWorkflows() {
    this.log('Testing Check-in Workflows...');

    try {
      // QR Code Check-in
      this.log('Testing QR Check-in...');
      const qrResult = await workflowService.processCheckIn({
        method: 'QR',
        qrCode: 'QR001',
        venue: 'Main Auditorium',
        printBadge: true
      });

      if (qrResult.success) {
        this.success('QR Check-in Successful', {
          guest: qrResult.data?.guest.name,
          badgePrinted: qrResult.data?.badgePrinted
        });
      }

      // Manual Check-in
      this.log('Testing Manual Check-in...');
      const manualResult = await workflowService.processCheckIn({
        method: 'Manual',
        guestId: '1',
        venue: 'Conference Room A',
        printBadge: false
      });

      if (manualResult.success) {
        this.success('Manual Check-in Successful', {
          guest: manualResult.data?.guest.name
        });
      }

    } catch (error) {
      this.error('Check-in Workflow Error', error);
    }
  }

  // ==================== TEST 3: Hospitality Packages ====================
  async testHospitalityPackages() {
    this.log('Testing Hospitality Packages...');

    try {
      // VIP Package
      const vipResult = await workflowService.createHospitalityPackage('1', 'vip');
      if (vipResult.success) {
        this.success('VIP Package Created', {
          services: vipResult.data?.length
        });
      }

      // Custom Package
      const customResult = await workflowService.createHospitalityPackage('2', 'custom', [
        {
          type: "Hotel",
          description: "Boutique Hotel - Executive Suite",
          serviceDate: "2024-01-22",
          cost: 1200
        },
        {
          type: "Meal",
          description: "Private chef for 2 meals",
          serviceDate: "2024-01-22",
          cost: 600
        }
      ]);

      if (customResult.success) {
        this.success('Custom Package Created', {
          services: customResult.data?.length
        });
      }

    } catch (error) {
      this.error('Hospitality Package Error', error);
    }
  }

  // ==================== TEST 4: CRUD Operations ====================
  async testCRUDOperations() {
    this.log('Testing CRUD Operations...');

    try {
      // CREATE Guest
      this.log('Creating new guest...');
      const guest = await guestService.createGuest({
        name: "CRUD Test Guest",
        email: "crud@test.com",
        phone: "+1 (555) 111-2222",
        category: "Delegate",
        status: "active",
        checkedIn: false,
        registrationDate: new Date().toISOString()
      });

      const guestId = guest.id;
      this.success('Guest Created', { id: guestId });

        // READ Guest
        this.log('Reading guest...');
        const readGuest = await guestService.getGuest(guestId);
        this.success('Guest Retrieved', { name: readGuest.name });

        // UPDATE Guest
        this.log('Updating guest...');
        const updatedGuest = await guestService.updateGuest(guestId, {
          designation: "Senior Developer",
          category: "Speaker"
        });
        this.success('Guest Updated', { 
          designation: updatedGuest.designation,
          category: updatedGuest.category
        });

    } catch (error) {
      this.error('CRUD Operations Error', error);
    }
  }

  // ==================== TEST 5: Bulk Operations ====================
  async testBulkOperations() {
    this.log('Testing Bulk Operations...');

    try {
      // Bulk Check-in
      const bulkCheckInResult = await workflowService.bulkCheckIn(
        ['1', '2', '3'], 
        'Main Hall', 
        'Manual'
      );

      if (bulkCheckInResult.success) {
        this.success('Bulk Check-in Completed', {
          successful: bulkCheckInResult.data?.successful.length,
          failed: bulkCheckInResult.data?.failed.length
        });
      }

    } catch (error) {
      this.error('Bulk Operations Error', error);
    }
  }

  // ==================== TEST 6: Guest Journey ====================
  async testGuestJourney() {
    this.log('Testing Guest Journey...');

    try {
      const journeyResult = await workflowService.getGuestJourney('1');

      if (journeyResult.success) {
        this.success('Guest Journey Retrieved', {
          guest: journeyResult.data?.guest.name,
          registrations: journeyResult.data?.registrations.length,
          checkIns: journeyResult.data?.checkIns.length,
          hospitality: journeyResult.data?.hospitality.length,
          events: journeyResult.data?.events.length
        });
      }

    } catch (error) {
      this.error('Guest Journey Error', error);
    }
  }

  // ==================== TEST 7: Event Management ====================
  async testEventManagement() {
    this.log('Testing Event Management...');

    try {
      const eventResult = await workflowService.createEventWithVenue({
        title: "Test Workshop",
        description: "Testing event creation workflow",
        startDate: "2024-02-01T10:00:00Z",
        endDate: "2024-02-01T16:00:00Z",
        venue: "Meeting Room 1",
        venueId: "2",
        capacity: 40,
        category: "Workshop",
        organizer: "Test Team"
      });

      if (eventResult.success) {
        this.success('Event with Venue Created', {
          event: eventResult.data?.event.title,
          venue: eventResult.data?.venue.name
        });
      }

    } catch (error) {
      this.error('Event Management Error', error);
    }
  }

  // ==================== TEST 8: Analytics & Reporting ====================
  async testAnalyticsReporting() {
    this.log('Testing Analytics & Reporting...');

    try {
      // Dashboard Stats
      const stats = await reportService.getDashboardStats();
      this.success('Dashboard Stats Retrieved', {
        totalGuests: stats.totalGuests,
        todayCheckIns: stats.todayCheckIns
      });

      // Chart Data
      const chartData = await reportService.getChartData('checkin-trends');
      this.success('Chart Data Retrieved', {
        dataPoints: chartData.length
      });

      // Venue Utilization Report
      const venueReportResult = await workflowService.getVenueUtilizationReport();
      if (venueReportResult.success) {
        this.success('Venue Utilization Report Generated', {
          venues: venueReportResult.data?.venues.length,
          overallUtilization: venueReportResult.data?.overallUtilization + '%'
        });
      }

    } catch (error) {
      this.error('Analytics & Reporting Error', error);
    }
  }

  // ==================== RUN ALL TESTS ====================
  async runAllTests() {
    this.log('🚀 Starting Business Workflow Test Suite...');
    console.time('Total Test Time');

    await this.testCompleteRegistration();
    await this.testCheckInWorkflows();
    await this.testHospitalityPackages();
    await this.testCRUDOperations();
    await this.testBulkOperations();
    await this.testGuestJourney();
    await this.testEventManagement();
    await this.testAnalyticsReporting();

    console.timeEnd('Total Test Time');
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const totalCount = this.results.filter(r => r.status).length;
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    return {
      results: this.results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: errorCount,
        successRate: (successCount / totalCount) * 100
      }
    };
  }

  // Get results for display
  getResults() {
    return this.results;
  }
}

// Usage:
// const tester = new BusinessWorkflowTester();
// await tester.runAllTests();

export default BusinessWorkflowTester;
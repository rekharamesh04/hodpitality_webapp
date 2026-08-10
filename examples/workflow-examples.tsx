/**
 * BUSINESS WORKFLOW EXAMPLES
 * 
 * This file demonstrates how to use the complete business workflow
 * and CRUD operations in the Hospitality Admin system.
 * 
 * All examples use MOCK DATA and can be integrated with real APIs later.
 */

'use client';

import { useWorkflow } from '@/hooks/useWorkflow';
import { useGuests } from '@/hooks/useGuests';
import { mockApiService } from '@/services/mockApi';

// ============================================
// EXAMPLE 1: Complete Guest Registration
// ============================================
export function ExampleCompleteRegistration() {
  const { completeRegistration, loading } = useWorkflow();

  const handleRegistration = async () => {
    const result = await completeRegistration({
      // Guest Details
      guestName: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 987-6543",
      company: "Tech Corp International",
      designation: "Chief Technology Officer",
      category: "VIP",
      
      // Event Details
      eventId: "evt_001",
      eventTitle: "Tech Summit 2024",
      
      // Payment
      paymentAmount: 500,
      
      // Hospitality Requests
      hospitalityRequests: [
        {
          type: "Hotel",
          description: "Presidential Suite - Grand Hotel (3 nights)",
          serviceDate: "2024-01-15",
          cost: 1500
        },
        {
          type: "Airport Pickup",
          description: "Luxury sedan with chauffeur",
          serviceDate: "2024-01-14T18:00:00Z",
          cost: 150
        },
        {
          type: "Meal",
          description: "VIP Dinner - All conference days",
          serviceDate: "2024-01-15",
          cost: 300
        }
      ],
      
      // Additional Information
      notes: "Requires vegetarian meals",
    });

    if (result.success) {
      console.log("✅ Registration Complete!");
      console.log("Guest:", result.data?.guest);
      console.log("Registration:", result.data?.registration);
      console.log("Hospitality Services:", result.data?.hospitality);
    }
  };

  return (
    <button onClick={handleRegistration} disabled={loading}>
      {loading ? 'Registering...' : 'Complete Registration'}
    </button>
  );
}

// ============================================
// EXAMPLE 2: Quick Check-In (QR Code)
// ============================================
export function ExampleQRCheckIn() {
  const { processCheckIn, loading } = useWorkflow();

  const handleQRCheckIn = async (qrCode: string) => {
    const result = await processCheckIn({
      method: 'QR',
      qrCode: qrCode,
      venue: 'Main Hall',
      printBadge: true,
    });

    if (result.success) {
      console.log("✅ Check-in Successful!");
      console.log("Guest:", result.data?.guest.name);
      console.log("Check-in Time:", result.data?.checkIn.checkInTime);
      console.log("Badge Printed:", result.data?.badgePrinted);
    }
  };

  return (
    <button onClick={() => handleQRCheckIn('QR001')}>
      Check In with QR
    </button>
  );
}

// ============================================
// EXAMPLE 3: Manual Check-In
// ============================================
export function ExampleManualCheckIn() {
  const { processCheckIn } = useWorkflow();

  const handleManualCheckIn = async (guestId: string) => {
    const result = await processCheckIn({
      method: 'Manual',
      guestId: guestId,
      venue: 'Conference Room A',
      printBadge: true,
    });

    if (result.success) {
      console.log("✅ Manual Check-in Complete!");
    }
  };

  return (
    <button onClick={() => handleManualCheckIn('guest_123')}>
      Manual Check In
    </button>
  );
}

// ============================================
// EXAMPLE 4: CRUD Operations - Guests
// ============================================
export function ExampleGuestCRUD() {
  const { guests, createGuest, updateGuest, deleteGuest, fetchGuests } = useGuests();

  // CREATE
  const handleCreate = async () => {
    await createGuest({
      name: "Michael Chen",
      email: "michael.chen@startup.io",
      phone: "+1 (555) 234-5678",
      company: "Startup IO",
      designation: "CTO",
      category: "Speaker",
      status: "active",
      checkedIn: false,
      registrationDate: new Date().toISOString(),
    });
  };

  // READ (with filters)
  const handleRead = async () => {
    await fetchGuests({
      search: "michael",
      category: "Speaker",
      status: "active",
      page: 1,
      pageSize: 10,
    });
  };

  // UPDATE
  const handleUpdate = async (guestId: string) => {
    await updateGuest(guestId, {
      designation: "Chief Technology Officer",
      category: "VIP",
    });
  };

  // DELETE
  const handleDelete = async (guestId: string) => {
    await deleteGuest(guestId);
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Guest</button>
      <button onClick={handleRead}>Search Guests</button>
      <button onClick={() => handleUpdate('guest_1')}>Update Guest</button>
      <button onClick={() => handleDelete('guest_1')}>Delete Guest</button>
      
      <ul>
        {guests.map(guest => (
          <li key={guest.id}>{guest.name} - {guest.category}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Bulk Check-In
// ============================================
export function ExampleBulkCheckIn() {
  const { bulkCheckIn } = useWorkflow();

  const handleBulkCheckIn = async () => {
    const guestIds = ['guest_1', 'guest_2', 'guest_3', 'guest_4'];
    
    const result = await bulkCheckIn(guestIds, 'Main Hall', 'Manual');

    if (result.success) {
      console.log(`✅ Bulk Check-in Complete!`);
      console.log(`Successful: ${result.data?.successful.length}`);
      console.log(`Failed: ${result.data?.failed.length}`);
      
      result.data?.failed.forEach(f => {
        console.log(`❌ Guest ${f.guestId}: ${f.error}`);
      });
    }
  };

  return (
    <button onClick={handleBulkCheckIn}>
      Bulk Check In
    </button>
  );
}

// ============================================
// EXAMPLE 6: Create Hospitality Package
// ============================================
export function ExampleHospitalityPackage() {
  const { createHospitalityPackage } = useWorkflow();

  // VIP Package
  const handleVIPPackage = async (guestId: string) => {
    const result = await createHospitalityPackage(guestId, 'vip');
    
    if (result.success) {
      console.log("✅ VIP Package Created!");
      console.log("Services:", result.data);
    }
  };

  // Custom Package
  const handleCustomPackage = async (guestId: string) => {
    const result = await createHospitalityPackage(guestId, 'custom', [
      {
        type: "Hotel",
        description: "Boutique Hotel - Suite",
        serviceDate: "2024-01-15",
        cost: 800
      },
      {
        type: "Special Request",
        description: "Private meeting room for 3 hours",
        serviceDate: "2024-01-16",
        cost: 300
      }
    ]);

    if (result.success) {
      console.log("✅ Custom Package Created!");
    }
  };

  return (
    <div>
      <button onClick={() => handleVIPPackage('guest_1')}>
        Create VIP Package
      </button>
      <button onClick={() => handleCustomPackage('guest_1')}>
        Create Custom Package
      </button>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Get Guest Journey
// ============================================
export function ExampleGuestJourney() {
  const { getGuestJourney } = useWorkflow();

  const handleGetJourney = async (guestId: string) => {
    const result = await getGuestJourney(guestId);

    if (result.success) {
      console.log("✅ Guest Journey Retrieved!");
      console.log("Guest:", result.data?.guest);
      console.log("Registrations:", result.data?.registrations);
      console.log("Check-ins:", result.data?.checkIns);
      console.log("Hospitality:", result.data?.hospitality);
      console.log("Events:", result.data?.events);
    }
  };

  return (
    <button onClick={() => handleGetJourney('guest_1')}>
      View Guest Journey
    </button>
  );
}

// ============================================
// EXAMPLE 8: All CRUD Operations
// ============================================
export async function demonstrateAllCRUDOperations() {
  
  // GUESTS
  console.log("📝 GUESTS CRUD:");
  const guestsResponse = await mockApiService.getGuests({ page: 1, pageSize: 10 });
  const createGuestResponse = await mockApiService.createGuest({
    name: "Test Guest",
    email: "test@example.com",
    phone: "+1234567890",
    category: "Delegate",
    status: "active",
    checkedIn: false,
    registrationDate: new Date().toISOString(),
  });
  
  // REGISTRATIONS
  console.log("📝 REGISTRATIONS CRUD:");
  await mockApiService.getRegistrations();
  await mockApiService.createRegistration({
    guestName: "Test Guest",
    guestEmail: "test@example.com",
    phone: "+1234567890",
    event: "Tech Summit 2024",
    registrationDate: new Date().toISOString(),
    status: "pending",
    paymentStatus: "pending",
    category: "Delegate",
  });
  
  // CHECK-INS
  console.log("📝 CHECK-INS:");
  await mockApiService.checkInByQr('QR001', 'Main Hall');
  
  // HOSPITALITY
  console.log("📝 HOSPITALITY CRUD:");
  await mockApiService.getHospitality();
  await mockApiService.createHospitality({
    guestId: "guest_1",
    guestName: "Test Guest",
    type: "Hotel",
    description: "Standard room",
    status: "pending",
    bookingDate: new Date().toISOString(),
    serviceDate: new Date().toISOString(),
  });
  
  // VENUES
  console.log("📝 VENUES CRUD:");
  await mockApiService.getVenues();
  await mockApiService.createVenue({
    name: "New Conference Room",
    capacity: 100,
    currentOccupancy: 0,
    type: "Meeting Room",
    location: "Building B - 3rd Floor",
    status: "active",
    amenities: ["WiFi", "Projector", "AC"],
  });
  
  // EVENTS
  console.log("📝 EVENTS CRUD:");
  await mockApiService.getEvents();
  await mockApiService.createEvent({
    title: "Workshop: AI Development",
    description: "Hands-on AI workshop",
    startDate: "2024-02-01T10:00:00Z",
    endDate: "2024-02-01T17:00:00Z",
    venue: "Conference Room A",
    venueId: "venue_1",
    status: "active",
    attendees: 0,
    capacity: 50,
    category: "Workshop",
    organizer: "Tech Academy",
  });
  
  // STAFF
  console.log("📝 STAFF CRUD:");
  await mockApiService.getStaff();
  await mockApiService.createStaff({
    name: "Jane Manager",
    email: "jane@example.com",
    phone: "+1234567890",
    role: "manager",
    department: "Operations",
    status: "active",
    joinedDate: new Date().toISOString(),
  });
  
  console.log("✅ All CRUD operations demonstrated!");
}
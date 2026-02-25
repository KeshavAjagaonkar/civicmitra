const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('../models/Complaint');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Migration');

    // Find documents where location is a string (old format)
    const complaints = await Complaint.find({ location: { $type: "string" } });
    console.log(`Found ${complaints.length} complaints to migrate.`);

    let count = 0;
    for (const complaint of complaints) {
      // Store the old string value
      const oldAddress = complaint.location;
      
      // Update to new GeoJSON format.
      // Default to Mumbai: [longitude, latitude]
      complaint.location = {
        type: 'Point',
        coordinates: [72.8777, 19.0760], 
        address: oldAddress || 'Unknown Address'
      };

      await complaint.save();
      count++;
    }

    console.log(`Migration complete. Updated ${count} complaints.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrateLocations();

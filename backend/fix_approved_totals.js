
import mongoose from 'mongoose';
import { Booking } from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixTotals() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nishant');

    const approved = await Booking.find({ status: 'approved' });
    console.log(`Checking ${approved.length} approved bookings...`);

    let count = 0;
    for (const b of approved) {
        if (b.grandTotal === 0 || !b.grandTotal) {
            let subtotal = 0;
            if (b.packages && b.packages.length > 0) {
                b.packages.forEach(p => {
                    if (p.category === 'catering') {
                        subtotal += (p.price || p.pricePerPlate || 0) * (b.guestCount || 0);
                    } else {
                        subtotal += (p.price || 0);
                    }
                });
            }

            b.subtotal = subtotal;
            b.tax = 0;
            b.grandTotal = subtotal;
            await b.save();
            count++;
            console.log(`Fixed booking ${b._id}: ${subtotal}`);
        }
    }

    console.log(`Total fixed: ${count}`);
    process.exit(0);
}

fixTotals();

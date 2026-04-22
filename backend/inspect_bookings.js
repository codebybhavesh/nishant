
import mongoose from 'mongoose';
import { Booking } from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nishant');
    const bookings = await Booking.find({ status: 'approved' }).limit(10).lean();
    console.log(JSON.stringify(bookings.map(b => ({
        id: b._id,
        pkgName: b.pkgName,
        packages: b.packages.map(p => ({ name: p.name, price: p.price, pricePerPlate: p.pricePerPlate, category: p.category })),
        guestCount: b.guestCount,
        subtotal: b.subtotal,
        grandTotal: b.grandTotal,
        estimatedTotal: b.estimatedTotal
    })), null, 2));
    process.exit(0);
}

inspect();

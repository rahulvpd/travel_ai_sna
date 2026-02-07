import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingForm = ({ destinationName, pricePerPerson }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);

    const totalPrice = guests * pricePerPerson;

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setStep(3); // Success
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h3 className="font-heading text-2xl text-white mb-4">Book Your Trip</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-vibrant-gold" /> Select Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-vibrant-gold"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                <Users className="w-4 h-4 text-vibrant-gold" /> Guests
                            </label>
                            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3">
                                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">-</button>
                                <span className="text-xl font-bold text-white">{guests}</span>
                                <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">+</button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <div className="text-white/60">Total Price</div>
                            <div className="text-2xl font-bold text-vibrant-gold">₹{totalPrice.toLocaleString()}</div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!date}
                            className="w-full py-4 bg-vibrant-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,204,0,0.3)] hover:shadow-[0_0_30px_rgba(255,204,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Proceed to Pay
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h3 className="font-heading text-2xl text-white mb-4">Payment</h3>

                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-white/60">Trip to</span>
                                <span className="text-white font-bold">{destinationName}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-white/60">Date</span>
                                <span className="text-white font-bold">{date}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10">
                                <span className="text-white/60">Total</span>
                                <span className="text-vibrant-gold font-bold">₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-vibrant-blue to-purple-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" /> Pay Now
                                </>
                            )}
                        </button>

                        <button onClick={() => setStep(1)} className="w-full text-white/40 hover:text-white text-sm">Cancel</button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                        >
                            <CheckCircle className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="font-heading text-3xl text-white mb-2">Booking Confirmed!</h3>
                        <p className="text-white/60 mb-8">Your ticket has been sent to {user?.email}</p>
                        <button
                            onClick={() => navigate('/planner')}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            View My Trips
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingForm;

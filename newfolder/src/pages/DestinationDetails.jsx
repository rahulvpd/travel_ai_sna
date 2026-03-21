import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Share2, Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import BookingForm from '../components/booking/BookingForm';

const DestinationDetails = () => {
    const { id } = useParams();
    const [isSaved, setIsSaved] = useState(false);

    // Data Dictionary
    const destinationsData = {
        1: {
            name: 'Madurai',
            tagline: 'The Athens of the East',
            description: 'Madurai is one of the oldest living cities in the world. Known for the majestic Meenakshi Amman Temple, it is a city that never sleeps, vibrant with culture, history, and devotion.',
            image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2670&auto=format&fit=crop',
            price: 2500,
            rating: 4.8,
            reviews: 1240,
            images: [
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        2: {
            name: 'Thanjavur',
            tagline: 'Rice Bowl of Tamil Nadu',
            description: 'Home to the Great Living Chola Temples, Thanjavur is a hub of art, architecture, and culture. The Brihadeeswarar Temple is a marvel of engineering and devotion.',
            image: 'https://images.unsplash.com/photo-1627894006066-b4528dc9052b?q=80&w=2670&auto=format&fit=crop',
            price: 2200,
            rating: 4.9,
            reviews: 890,
            images: [
                'https://images.unsplash.com/photo-1599136152766-3d7c588523b0?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1627894006066-b4528dc9052b?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        3: {
            name: 'Mahabalipuram',
            tagline: 'Stone Carvings & Shore Temples',
            description: 'A UNESCO World Heritage site known for its rock-cut temples and shore temple. A perfect blend of history and beach vibes.',
            image: 'https://images.unsplash.com/photo-1621327017866-26795b87702f?q=80&w=2670&auto=format&fit=crop',
            price: 3000,
            rating: 4.7,
            reviews: 1560,
            images: [
                'https://images.unsplash.com/photo-1621327017866-26795b87702f?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        4: {
            name: 'Ooty',
            tagline: 'Queen of Hill Stations',
            description: 'Famous for its tea gardens, pleasant weather, and the Nilgiri Mountain Railway. A perfect escape into nature.',
            image: 'https://images.unsplash.com/photo-1548685122-f6b97645f629?q=80&w=2670&auto=format&fit=crop',
            price: 4500,
            rating: 4.6,
            reviews: 2100,
            images: [
                'https://images.unsplash.com/photo-1548685122-f6b97645f629?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        5: {
            name: 'Kodaikanal',
            tagline: 'Princess of Hill Stations',
            description: 'Known for its star-shaped lake and misty cliffs. Kodaikanal offers a serene retreat with beautiful waterfalls and treks.',
            image: 'https://images.unsplash.com/photo-1596707328599-28c0c1969a59?q=80&w=2670&auto=format&fit=crop',
            price: 4000,
            rating: 4.7,
            reviews: 1800,
            images: [
                'https://images.unsplash.com/photo-1596707328599-28c0c1969a59?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        6: {
            name: 'Yercaud',
            tagline: 'Jewel of the South',
            description: 'A quiet and pristine hill station in the Shevaroy Hills. Known for orange groves, coffee plantations, and spice gardens.',
            image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=2574&auto=format&fit=crop',
            price: 3500,
            rating: 4.5,
            reviews: 650,
            images: [
                'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        7: {
            name: 'Dhanushkodi',
            tagline: 'Ghost Town & Mystic Beach',
            description: 'The last land of India, where the Indian Ocean meets the Bay of Bengal. A place of haunting beauty and history.',
            image: 'https://images.unsplash.com/photo-1616853610260-84524c552026?q=80&w=2670&auto=format&fit=crop',
            price: 3200,
            rating: 4.9,
            reviews: 950,
            images: [
                'https://images.unsplash.com/photo-1616853610260-84524c552026?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        },
        8: {
            name: 'Pondicherry',
            tagline: 'French Riviera of the East',
            description: 'A former French colony with a unique blend of Tamil and French culture. Famous for Auroville, beaches, and cafes.',
            image: 'https://images.unsplash.com/photo-1582915293040-349929235d25?q=80&w=2670&auto=format&fit=crop',
            price: 5000,
            rating: 4.7,
            reviews: 2500,
            images: [
                'https://images.unsplash.com/photo-1582915293040-349929235d25?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1620046522501-f236e7a2e54e?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop'
            ]
        },
        9: {
            name: 'Kanyakumari',
            tagline: 'Tip of India',
            description: 'The southernmost tip of mainland India. Famous for the Vivekananda Rock Memorial and spectacular sunrises.',
            image: 'https://images.unsplash.com/photo-1598322634336-d446927d3536?q=80&w=2670&auto=format&fit=crop',
            price: 2800,
            rating: 4.6,
            reviews: 2200,
            images: [
                'https://images.unsplash.com/photo-1598322634336-d446927d3536?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1605441577038-161b476e8206?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
            ]
        }
    };

    const destination = destinationsData[id] || destinationsData[1]; // Fallback to Madurai


    return (
        <div className="min-h-screen bg-transparent text-white relative">

            {/* HEROT SECTION */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-black/30" />

                <div className="absolute bottom-0 left-0 p-10 container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="text-vibrant-gold font-bold tracking-widest uppercase mb-2 block">{destination.tagline}</span>
                        <h1 className="font-heading text-7xl md:text-9xl font-bold mb-4 text-glow-gold">{destination.name}</h1>
                        <div className="flex items-center gap-6 text-white/80">
                            <span className="flex items-center gap-2"><MapPin size={20} className="text-vibrant-pink" /> Tamil Nadu, India</span>
                            <span className="flex items-center gap-2"><Star size={20} className="text-vibrant-gold fill-vibrant-gold" /> {destination.rating} ({destination.reviews} Reviews)</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-16">

                    {/* LEFT: Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            <h2 className="font-heading text-4xl mb-6">About the Destination</h2>
                            <p className="text-xl text-white/70 leading-relaxed font-light">{destination.description}</p>
                        </motion.div>

                        <div>
                            <h3 className="font-heading text-3xl mb-6">Gallery</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {destination.images.map((img, i) => (
                                    <img key={i} src={img} className="rounded-2xl hover:scale-105 transition-transform duration-500 cursor-pointer" alt="Gallery" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Booking Card */}
                    <div className="relative">
                        <div className="sticky top-32">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-3xl font-bold text-white">₹{destination.price}<span className="text-base font-normal text-white/60"> / person</span></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsSaved(!isSaved)} className={`p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors ${isSaved ? 'text-vibrant-pink fill-vibrant-pink' : 'text-white'}`}>
                                        <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                                    </button>
                                    <button className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-white transition-colors">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <BookingForm destinationName={destination.name} pricePerPerson={destination.price} />
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default DestinationDetails;
